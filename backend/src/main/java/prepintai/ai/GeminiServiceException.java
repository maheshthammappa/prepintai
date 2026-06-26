// ─────────────────────────────────────────────────────────────────────────────
// ai/GeminiServiceException.java
//
// PURPOSE:
//   A custom RuntimeException used exclusively for errors originating from
//   the Gemini API integration (e.g. rate limits, network timeouts).
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.ai;

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
