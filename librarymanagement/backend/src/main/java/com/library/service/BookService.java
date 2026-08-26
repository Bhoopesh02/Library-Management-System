package com.library.service;

import com.library.dto.BookRequest;
import com.library.model.Book;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Page<Book> getAllBooks(String search, String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("title").ascending());
        
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasCategory = category != null && !category.trim().isEmpty();

        if (hasSearch && hasCategory) {
            return bookRepository.searchBooksByCategory(category, search, pageable);
        } else if (hasSearch) {
            return bookRepository.searchBooks(search, pageable);
        } else if (hasCategory) {
            return bookRepository.findByCategory(category, pageable);
        }
        return bookRepository.findAll(pageable);
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    public Book addBook(BookRequest request) {
        if (!com.library.constants.BookCategory.isValid(request.getCategory())) {
            throw new RuntimeException("Invalid book category.");
        }
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCategory(request.getCategory());
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getTotalCopies());
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());
        
        return bookRepository.save(book);
    }

    public Book updateBook(String id, BookRequest request) {
        if (!com.library.constants.BookCategory.isValid(request.getCategory())) {
            throw new RuntimeException("Invalid book category.");
        }
        Book existingBook = getBookById(id);
        
        int diff = request.getTotalCopies() - existingBook.getTotalCopies();
        int newAvailable = existingBook.getAvailableCopies() + diff;
        
        if (newAvailable < 0) {
            throw new RuntimeException("Cannot reduce total copies below currently issued copies");
        }

        existingBook.setTitle(request.getTitle());
        existingBook.setAuthor(request.getAuthor());
        existingBook.setIsbn(request.getIsbn());
        existingBook.setCategory(request.getCategory());
        existingBook.setPublisher(request.getPublisher());
        existingBook.setPublicationYear(request.getPublicationYear());
        existingBook.setDescription(request.getDescription());
        existingBook.setTotalCopies(request.getTotalCopies());
        existingBook.setAvailableCopies(newAvailable);
        existingBook.setUpdatedAt(LocalDateTime.now());

        return bookRepository.save(existingBook);
    }

    public void deleteBook(String id) {
        Book book = getBookById(id);
        if (book.getAvailableCopies() < book.getTotalCopies()) {
            throw new RuntimeException("Cannot delete book while copies are issued");
        }
        bookRepository.deleteById(id);
    }
    
    public Book saveBookDirectly(Book book) {
        return bookRepository.save(book);
    }
}
