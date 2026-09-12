package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.model.Fine;
import com.library.service.FineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    @Autowired
    private FineService fineService;

    @PreAuthorize("@securityValidationService.isCurrentlyAdminOrMaster(authentication.name)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Fine>>> getAllFines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Fines retrieved", fineService.getAllFines(page, size)));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN') or #userId == authentication.principal.user.id")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<Fine>>> getFinesByUser(
            @PathVariable("userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("User fines retrieved", fineService.getFinesByUser(userId, page, size)));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN') or #userId == authentication.principal.user.id")
    @GetMapping("/summary/user/{userId}")
    public ResponseEntity<ApiResponse<java.util.Map<String, Double>>> getUserFineSummary(
            @PathVariable("userId") String userId) {
        return ResponseEntity.ok(ApiResponse.success("User fine summary retrieved", fineService.getUserFineSummary(userId)));
    }

    @PreAuthorize("@securityValidationService.isCurrentlyAdminOrMaster(authentication.name)")
    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Fine>> payFine(@PathVariable("id") String id) {
        Fine fine = fineService.payFine(id);
        return ResponseEntity.ok(ApiResponse.success("Fine marked as paid", fine));
    }
}
