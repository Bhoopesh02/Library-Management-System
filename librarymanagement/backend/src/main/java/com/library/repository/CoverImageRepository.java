package com.library.repository;

import com.library.model.CoverImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoverImageRepository extends MongoRepository<CoverImage, String> {
    Optional<CoverImage> findByBookIdAndSide(String bookId, String side);
    void deleteByBookIdAndSide(String bookId, String side);
}
