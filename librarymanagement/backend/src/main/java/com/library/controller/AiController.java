package com.library.controller;

import com.library.dto.AiChatRequest;
import com.library.dto.AiChatResponse;
import com.library.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.library.security.RateLimiterService;
import java.security.Principal;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private RateLimiterService rateLimiterService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request, Principal principal) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new AiChatResponse("Message cannot be empty."));
        }

        if (request.getMessage().length() > 3000) {
            return ResponseEntity.badRequest().body(new AiChatResponse("Message exceeds the maximum length of 3000 characters."));
        }

        String userEmail = (principal != null) ? principal.getName() : "anonymous";
        if (!rateLimiterService.tryConsumeAiChat(userEmail)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new AiChatResponse("You have exceeded the AI chat rate limit (10 requests per hour). Please try again later."));
        }

        String reply = aiService.getChatResponse(request.getMessage());
        return ResponseEntity.ok(new AiChatResponse(reply));
    }
}
