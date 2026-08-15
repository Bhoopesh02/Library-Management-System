package com.library.repository;

import com.library.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends MongoRepository<Book, String> {
    
    @Query("{ '$or': [ { 'title': { $regex: ?0, $options: 'i' } }, { 'author': { $regex: ?0, $options: 'i' } }, { 'isbn': { $regex: ?0, $options: 'i' } } ] }")
    Page<Book> searchBooks(String search, Pageable pageable);

    Page<Book> findByCategory(String category, Pageable pageable);

    @Query("{ '$and': [ { 'category': ?0 }, { '$or': [ { 'title': { $regex: ?1, $options: 'i' } }, { 'author': { $regex: ?1, $options: 'i' } }, { 'isbn': { $regex: ?1, $options: 'i' } } ] } ] }")
    Page<Book> searchBooksByCategory(String category, String search, Pageable pageable);
}
