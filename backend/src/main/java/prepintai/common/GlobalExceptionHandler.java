// ─────────────────────────────────────────────────────────────────────────────
// common/GlobalExceptionHandler.java
//
// PURPOSE:
//   Intercepts unhandled exceptions thrown anywhere in the application and
//   converts them into standard, readable JSON HTTP responses.
//
// DATA FLOW:
//   1. A Controller throws an exception (e.g., GeminiServiceException).
//   2. Spring Boot catches it and looks for an @ExceptionHandler.
//   3. This class handles the exception, formats an HTTP 503 response, and
//      sends a user-friendly message back to the React frontend.
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.common;

import prepintai.ai.GeminiServiceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

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
