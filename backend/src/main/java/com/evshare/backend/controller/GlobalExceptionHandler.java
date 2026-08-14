package com.evshare.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handleMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        System.err.println("URL that caused MethodArgumentTypeMismatchException: " + request.getRequestURI());
        return ResponseEntity.badRequest().body("Invalid ID format");
    }
}
