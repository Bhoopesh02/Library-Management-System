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

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Book>>> getAllBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Book> books = bookService.getAllBooks(search, category, page, size);
        return ResponseEntity.ok(ApiResponse.success("Books retrieved successfully", books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable String id) {
        Book book = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success("Book retrieved successfully", book));
    }

    // Only ADMIN (protected by SecurityConfig)
    @PostMapping
    public ResponseEntity<ApiResponse<Book>> addBook(@Valid @RequestBody BookRequest request) {
        Book book = bookService.addBook(request);
        return ResponseEntity.ok(ApiResponse.success("Book added successfully", book));
    }

    // Only ADMIN
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> updateBook(@PathVariable String id, @Valid @RequestBody BookRequest request) {
        Book book = bookService.updateBook(id, request);
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", book));
    }

    // Only ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }
    
    // Only ADMIN
    @PostMapping("/{id}/cover")
    public ResponseEntity<ApiResponse<Book>> uploadCover(
            @PathVariable String id,
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
            
            Path uploadPath = Paths.get("uploads", "covers");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = id + "-" + side + ".webp";
            File outputFile = uploadPath.resolve(filename).toFile();

            ImmutableImage image = ImmutableImage.loader().fromBytes(file.getBytes());
            if (image.width > 800 || image.height > 800) {
                if (image.width > image.height) {
                    image = image.scaleToWidth(800);
                } else {
                    image = image.scaleToHeight(800);
                }
            }
            
            image.output(WebpWriter.DEFAULT.withQ(90), outputFile);

            String fileUrl = "/uploads/covers/" + filename;
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
}
