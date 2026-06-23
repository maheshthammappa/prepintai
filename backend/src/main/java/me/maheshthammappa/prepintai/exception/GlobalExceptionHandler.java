package me.maheshthammappa.prepintai.exception;

import me.maheshthammappa.prepintai.service.GeminiServiceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Global exception handler to intercept controller exceptions and format user-friendly responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Intercepts GeminiServiceExceptions and returns an HTTP 503 (Service Unavailable) status
     * along with the user-friendly message in the JSON body.
     */
    @ExceptionHandler(GeminiServiceException.class)
    public ResponseEntity<Map<String, String>> handleGeminiServiceException(GeminiServiceException ex) {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", ex.getMessage()));
    }
}
