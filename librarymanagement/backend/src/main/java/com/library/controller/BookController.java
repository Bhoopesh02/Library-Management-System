package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.BookRequest;
import com.library.model.Book;
import com.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.sksamuel.scrimage.ImmutableImage;
import com.sksamuel.scrimage.webp.WebpWriter;

import com.library.model.CoverImage;
import com.library.repository.CoverImageRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;

import java.util.Optional;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private CoverImageRepository coverImageRepository;

    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Book>>> getAllBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Book> books = bookService.getAllBooks(search, category, page, size);
        return ResponseEntity.ok(ApiResponse.success("Books retrieved successfully", books));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable("id") String id) {
        Book book = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success("Book retrieved successfully", book));
    }

    // Only ADMIN (protected by SecurityConfig)
    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @PostMapping
    public ResponseEntity<ApiResponse<Book>> addBook(@Valid @RequestBody BookRequest request) {
        Book book = bookService.addBook(request);
        return ResponseEntity.ok(ApiResponse.success("Book added successfully", book));
    }

    // Only ADMIN
    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> updateBook(@PathVariable("id") String id, @Valid @RequestBody BookRequest request) {
        Book book = bookService.updateBook(id, request);
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", book));
    }

    // Only ADMIN
    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable("id") String id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }
    
    // Only ADMIN
    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @PostMapping("/{id}/cover")
    public ResponseEntity<ApiResponse<Book>> uploadCover(
            @PathVariable("id") String id,
            @RequestParam("side") String side,
            @RequestParam("file") MultipartFile file) {
        
        if (!"front".equals(side) && !"back".equals(side)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid side. Must be 'front' or 'back'"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File exceeds 5MB limit"));
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid file type. Only JPG, PNG, and WebP are allowed"));
        }

        try {
            Book book = bookService.getBookById(id);

            ImmutableImage image;
            try {
                image = ImmutableImage.loader().fromBytes(file.getBytes());
            } catch (Exception e) {
                // Magic byte validation failed - file is not a valid image
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid image format or corrupted file."));
            }

            if (image.width > 800 || image.height > 800) {
                if (image.width > image.height) {
                    image = image.scaleToWidth(800);
                } else {
                    image = image.scaleToHeight(800);
                }
            }
            
            byte[] webpBytes = image.bytes(WebpWriter.DEFAULT.withQ(90));

            // Save to MongoDB CoverImage collection
            CoverImage coverImage = coverImageRepository.findByBookIdAndSide(id, side)
                    .orElse(new CoverImage());
            coverImage.setBookId(id);
            coverImage.setSide(side);
            coverImage.setContentType("image/webp");
            coverImage.setData(webpBytes);
            coverImageRepository.save(coverImage);

            String fileUrl = "/api/books/" + id + "/coverImage?side=" + side;
            if ("front".equals(side)) {
                book.setFrontCoverUrl(fileUrl);
            } else {
                book.setBackCoverUrl(fileUrl);
            }

            Book updatedBook = bookService.saveBookDirectly(book);
            return ResponseEntity.ok(ApiResponse.success("Cover uploaded successfully", updatedBook));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to process image: " + e.getMessage()));
        }
    }
    
    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @DeleteMapping("/{id}/cover")
    public ResponseEntity<ApiResponse<Book>> deleteCover(
            @PathVariable("id") String id,
            @RequestParam("side") String side) {
        
        if (!"front".equals(side) && !"back".equals(side)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid side. Must be 'front' or 'back'"));
        }

        try {
            Book book = bookService.getBookById(id);
            
            // Delete from MongoDB
            coverImageRepository.deleteByBookIdAndSide(id, side);

            // Clear the URL in the database
            if ("front".equals(side)) {
                book.setFrontCoverUrl(null);
            } else {
                book.setBackCoverUrl(null);
            }

            Book updatedBook = bookService.saveBookDirectly(book);
            return ResponseEntity.ok(ApiResponse.success("Cover deleted successfully", updatedBook));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to delete cover: " + e.getMessage()));
        }
    }

    // Publicly accessible via SecurityConfig
    @GetMapping("/{id}/coverImage")
    public ResponseEntity<byte[]> getCoverImage(
            @PathVariable String id,
            @RequestParam("side") String side) {
        
        Optional<CoverImage> coverOpt = coverImageRepository.findByBookIdAndSide(id, side);
        
        if (coverOpt.isPresent()) {
            CoverImage cover = coverOpt.get();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(cover.getContentType()))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000") // Cache for 1 year
                    .body(cover.getData());
        }
        
        return ResponseEntity.notFound().build();
    }
}
