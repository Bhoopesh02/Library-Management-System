package com.library.controller;

import com.library.dto.ApiResponse;
import com.library.dto.DeleteAccountRequest;
import com.library.model.User;
import com.library.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", userService.getAllUsers(search, page, size)));
    }

    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved", userService.getUserById(id)));
    }

    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(@PathVariable String id, @RequestParam User.Status status) {
        return ResponseEntity.ok(ApiResponse.success("User status updated", userService.updateUserStatus(id, status)));
    }

    @PreAuthorize("@securityValidationService.isCurrentlyAdmin(authentication.name)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable String id,
            @Valid @RequestBody DeleteAccountRequest request,
            Authentication authentication) {
        userService.deleteUserAccount(id, request.getMasterKey(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully", null));
    }
}

