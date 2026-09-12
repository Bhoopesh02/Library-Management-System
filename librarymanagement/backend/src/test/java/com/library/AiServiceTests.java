package com.library;

import com.library.service.AiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class AiServiceTests {

    @Autowired
    private AiService aiService;

    @Autowired
    private com.library.repository.BookRepository bookRepository;

    @Test
    public void runAllTests() throws InterruptedException {
        // Setup books for tests
        bookRepository.deleteAll();
        
        com.library.model.Book javaBook = new com.library.model.Book();
        javaBook.setTitle("Effective Java");
        javaBook.setAuthor("Joshua Bloch");
        javaBook.setCategory("Programming");
        javaBook.setDescription("A programming book about Java best practices.");
        javaBook.setAvailableCopies(5);
        bookRepository.save(javaBook);

        com.library.model.Book tolkienBook = new com.library.model.Book();
        tolkienBook.setTitle("The Hobbit");
        tolkienBook.setAuthor("J.R.R. Tolkien");
        tolkienBook.setCategory("Fantasy");
        tolkienBook.setDescription("A fantasy novel by Tolkien.");
        tolkienBook.setAvailableCopies(2);
        bookRepository.save(tolkienBook);

        com.library.model.Book gatsbyBook = new com.library.model.Book();
        gatsbyBook.setTitle("The Great Gatsby");
        gatsbyBook.setAuthor("F. Scott Fitzgerald");
        gatsbyBook.setCategory("Fiction");
        gatsbyBook.setDescription("A novel set in the Roaring Twenties.");
        gatsbyBook.setAvailableCopies(0); // Test availability
        bookRepository.save(gatsbyBook);

        com.library.model.Book catalogueBook = new com.library.model.Book();
        catalogueBook.setTitle("The Catalogue of Everything");
        catalogueBook.setAuthor("Jane Smith");
        catalogueBook.setCategory("Reference");
        catalogueBook.setDescription("A comprehensive catalogue of all things.");
        catalogueBook.setAvailableCopies(1);
        bookRepository.save(catalogueBook);

        String[] testCases = {
            "What are available titles?",
            "What books do you have?",
            "Do you have books by J.K. Rowling?",
            "Do you have the book The Catalogue of Everything?"
        };


        System.out.println("==================================================");
        System.out.println("AI ASSISTANT SECURITY TESTS");
        System.out.println("==================================================");

        for (int i = 0; i < testCases.length; i++) {
            System.out.println("TEST " + (i + 1) + ":");
            System.out.println("User: " + testCases[i]);
            System.out.println("Expected: [See original prompt]");
            
            try {
                String response = aiService.getChatResponse(testCases[i]);
                System.out.println("Actual Response:");
                System.out.println(response);
            } catch (Exception e) {
                System.out.println("Actual Response:");
                System.out.println("Error or rejected: " + e.getMessage());
            }
            System.out.println("--------------------------------------------------");
            
            // Sleep for 8 seconds to avoid Gemini Free Tier rate limits (15 RPM)
            Thread.sleep(8000);
        }
    }
}
