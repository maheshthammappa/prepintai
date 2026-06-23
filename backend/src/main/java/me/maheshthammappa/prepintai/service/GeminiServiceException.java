package me.maheshthammappa.prepintai.service;

/**
 * Custom runtime exception thrown when Gemini API calls fail after exhausting all retry attempts,
 * or when non-retryable issues occur.
 */
public class GeminiServiceException extends RuntimeException {
    
    public GeminiServiceException(String message) {
        super(message);
    }

    public GeminiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
