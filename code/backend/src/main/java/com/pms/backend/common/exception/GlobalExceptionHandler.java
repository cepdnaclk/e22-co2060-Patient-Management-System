package com.pms.backend.common.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
// @RestControllerAdvice: watches ALL controllers.
// When any controller throws an exception, this class catches it.
public class GlobalExceptionHandler {

    // Catches AppException — our custom errors
    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, String>> handleApp(AppException ex) {
        // Frontend receives: { "message": "Email already registered" }
        return ResponseEntity
                .status(ex.getStatus())
                .body(Map.of("message", ex.getMessage()));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(
            DataIntegrityViolationException ex) {

        // 1. PRINT THE REAL ERROR TO YOUR CONSOLE SO YOU CAN READ IT!
        System.out.println("REAL DB ERROR: " + ex.getMessage());
        ex.printStackTrace();

        String message = "A database constraint was violated.";
        String detail = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";

        // 2. Look for the EXACT constraint names your database generates,
        // not just generic words. (Adjust these to match your actual DB constraint names).
        if (detail.contains("users_email_key") || detail.contains("uk_email")) {
            message = "This email is already registered.";
        } else if (detail.contains("users_mobile_key") || detail.contains("uk_mobile")) {
            message = "This mobile number is already registered.";
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("message", message));
    }
    // Catches @Valid validation failures
    // Example: email is blank, password too short
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError err : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(err.getField(), err.getDefaultMessage());
        }
        // Frontend receives:
        // { "message": "Validation failed",
        //   "errors": { "email": "Please enter a valid email",
        //               "password": "Must be at least 8 characters" } }
        return ResponseEntity.badRequest().body(Map.of(
                "message", "Validation failed",
                "errors",  fieldErrors
        ));
    }

    // Catch-all — any unhandled exception
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAll(Exception ex) {
        ex.printStackTrace(); // Print to console so you can debug
        return ResponseEntity.internalServerError()
                .body(Map.of("message", "An error occurred. Please try again."));
    }
}
