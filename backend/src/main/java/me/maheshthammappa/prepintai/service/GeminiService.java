package me.maheshthammappa.prepintai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import me.maheshthammappa.prepintai.dto.AnswerSubmission;
import me.maheshthammappa.prepintai.dto.InterviewReport;
import me.maheshthammappa.prepintai.dto.QuestionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public GeminiService() {
        this(RestClient.create(), new ObjectMapper());
    }

    // Constructor for testing
    GeminiService(RestClient restClient, ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Helper record schemas for the Gemini API Request
     */
    record GeminiRequest(List<Content> contents, GenerationConfig generationConfig) {
        record Content(List<Part> parts) {}
        record Part(String text) {}
        record GenerationConfig(String responseMimeType) {}
    }

    /**
     * Helper record schemas for the Gemini API Response
     */
    record GeminiResponse(List<Candidate> candidates) {
        record Candidate(Content content) {}
        record Content(List<Part> parts) {}
        record Part(String text) {}
    }

    /**
     * Calls Gemini API to generate the requested number of interview questions on a topic.
     */
    public QuestionResponse generateQuestions(String topic, String experienceLevel, int questionCount) {
        String prompt = String.format(
            "You are an expert technical interviewer.\n" +
            "Generate exactly %d interview questions for the topic: \"%s\" and experience level: \"%s\".\n" +
            "The questions should cover deep conceptual, syntactical, framework design, performance tuning, and architectural scenarios.\n" +
"Each question must be concise, professional, and interview-ready.\n" +
"Keep each question should contain maximum 30 words and 3 sentences .\n" +
"Never exceed 40 words.\n" +
"Do not include explanations, hints, examples, expected answers, follow-up questions, or background context.\n" +
"Write questions exactly as a real interviewer would ask them.\n" +
            "You must return the response strictly as a JSON object matching this schema:\n" +
            "{\n" +
            "  \"topic\": \"topic name\",\n" +
            "  \"experienceLevel\": \"experience level\",\n" +
            "  \"questions\": [\n" +
            "    {\n" +
            "      \"id\": 1,\n" +
            "      \"questionText\": \"Question description...\"\n" +
            "    }\n" +
            "  ]\n" +
            "}\n" +
            "Do not return any markdown formatting outside of JSON. Do not prefix with ```json or anything. Just raw JSON.",
            questionCount, topic, experienceLevel
        );

        try {
            String rawJsonString = callGeminiApi(prompt);
            return objectMapper.readValue(rawJsonString, QuestionResponse.class);
        } catch (GeminiServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate questions from Gemini: " + e.getMessage(), e);
        }
    }

    /**
     * Calls Gemini API to evaluate candidate answers.
     */
    public InterviewReport evaluateInterview(AnswerSubmission submission) {
        // Build answer details string for prompt
        StringBuilder answersBuilder = new StringBuilder();
        for (var answer : submission.answers()) {
            answersBuilder.append(String.format(
                "Question ID %d: %s\nCandidate Answer: %s\n\n",
                answer.questionId(), answer.questionText(), answer.userAnswer()
            ));
        }

        String prompt = String.format(
            "You are an expert technical interviewer and AI grader.\n" +
            "You are provided with a candidate's answers to the interview questions on the topic: \"%s\" and experience level: \"%s\".\n\n" +
            "Candidate Answers:\n%s\n" +
            "Evaluate the candidate's responses. Provide a question-by-question evaluation. For each question, determine a score (0-100), give comprehensive feedback pointing out correct aspects and gaps.\n" +
            "The \"suggestedAnswer\" must represent how a strong candidate would answer in a real technical interview.\n" +
            "Keep suggestedAnswer concise (maximum 7 sentences, maximum 150 words).\n" +
            "Focus on key concepts, practical understanding, and interview-ready communication.\n" +
            "Do not provide long tutorials, detailed explanations, step-by-step guides, or extensive code examples.\n" +
            "Include a precise code snippet only if necessary.\n" +
            "Also provide overall statistics: an overall score (0-100), key strengths, key weaknesses, suggestions for improvement, and a summary feedback report.\n" +
            "You must return the response strictly as a JSON object matching this schema:\n" +
            "{\n" +
            "  \"overallScore\": 85,\n" +
            "  \"overallSummary\": \"overall summary\",\n" +
            "  \"strengths\": [\"strength 1\", \"strength 2\"],\n" +
            "  \"weaknesses\": [\"weakness 1\", \"weakness 2\"],\n" +
            "  \"improvementSuggestions\": [\"suggestion 1\", \"suggestion 2\"],\n" +
            "  \"evaluations\": [\n" +
            "    {\n" +
            "      \"questionId\": 1,\n" +
            "      \"questionText\": \"...\",\n" +
            "      \"userAnswer\": \"...\",\n" +
            "      \"score\": 80,\n" +
            "      \"feedback\": \"...\",\n" +
            "      \"suggestedAnswer\": \"...\"\n" +
            "    }\n" +
            "  ]\n" +
            "}\n" +
            "If a question is left blank or skipped, grade it 0 and provide constructive feedback and the model answer.\n" +
            "Do not return any markdown formatting outside of JSON. Just raw JSON.",
            submission.topic(), submission.experienceLevel(), answersBuilder.toString()
        );

        try {
            String rawJsonString = callGeminiApi(prompt);
            return objectMapper.readValue(rawJsonString, InterviewReport.class);
        } catch (GeminiServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate interview from Gemini: " + e.getMessage(), e);
        }
    }

    /**
     * Executes POST request to Gemini REST API with retry handling and exponential backoff.
     * Retries up to 4 attempts only for temporary HTTP errors (429, 503, 504).
     */
    private String callGeminiApi(String prompt) {
        String finalUrl = geminiApiUrl + "?key=" + geminiApiKey;

        // Build Payload matching Gemini structure
        GeminiRequest.Part part = new GeminiRequest.Part(prompt);
        GeminiRequest.Content content = new GeminiRequest.Content(List.of(part));
        GeminiRequest.GenerationConfig config = new GeminiRequest.GenerationConfig("application/json");
        GeminiRequest requestPayload = new GeminiRequest(List.of(content), config);

        int maxAttempts = 4;
        // Delays between attempts: Attempt 1 is immediate (no wait).
        // Attempt 2 waits 2 seconds, Attempt 3 waits 4 seconds, Attempt 4 waits 6 seconds.
        int[] backoffDelaysSeconds = {0, 2, 4, 6};
        Throwable lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            if (attempt > 1) {
                int waitSeconds = backoffDelaysSeconds[attempt - 1];
                logger.info("Temporary error on attempt {}. Waiting {} seconds before retry attempt {}...",
                        attempt - 1, waitSeconds, attempt);
                try {
                    Thread.sleep(waitSeconds * 1000L);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new GeminiServiceException("Retry backoff interrupted", ie);
                }
            }

            try {
                return executeGeminiRequest(finalUrl, requestPayload);
            } catch (HttpStatusCodeException e) {
                lastException = e;
                int statusCode = e.getStatusCode().value();

                if (statusCode == 429 || statusCode == 503 || statusCode == 504) {
                    // Log retry attempt number, HTTP status code, and wait duration for the next attempt if we haven't reached max
                    if (attempt < maxAttempts) {
                        int nextWaitSeconds = backoffDelaysSeconds[attempt];
                        logger.warn("Gemini API call failed (Attempt {}/{}). HTTP Status Code: {}. Retrying in {} seconds. Error: {}",
                                attempt, maxAttempts, statusCode, nextWaitSeconds, e.getMessage());
                    } else {
                        logger.error("Gemini API call failed after max attempts (Attempt {}/{}). HTTP Status Code: {}. Error: {}",
                                attempt, maxAttempts, statusCode, e.getMessage());
                    }
                } else {
                    // Do NOT retry for 400 Bad Request, 401 Unauthorized, 403 Forbidden or other status codes.
                    logger.error("Non-retryable HTTP error calling Gemini API (Attempt {}/{}). HTTP Status Code: {}. Error: {}",
                            attempt, maxAttempts, statusCode, e.getMessage());
                    throw new GeminiServiceException("Error communicating with Gemini API: " + e.getMessage(), e);
                }
            } catch (Exception e) {
                // Non-HTTP-status exception (connection refused, hostname unresolved, socket timeout, etc.)
                // These are treated as config/system errors or other non-retryable issues.
                lastException = e;
                logger.error("Non-retryable error calling Gemini API (Attempt {}/{}). Error: {}",
                        attempt, maxAttempts, e.getMessage());
                throw new GeminiServiceException("Error communicating with Gemini API: " + e.getMessage(), e);
            }
        }

        // If we reach here, all 4 attempts failed with temporary HTTP errors (429, 503, 504)
        String finalReason = lastException != null ? lastException.getMessage() : "Unknown";
        logger.error("Gemini API call failed after {} attempts. Final failure reason: {}", maxAttempts, finalReason);
        throw new GeminiServiceException(
                "The AI service is currently experiencing high demand. Please try again in a few moments.",
                lastException
        );
    }

    /**
     * Executes a single POST request to the Gemini REST API and extracts the raw JSON text response.
     */
    private String executeGeminiRequest(String finalUrl, GeminiRequest requestPayload) {
        GeminiResponse response = restClient.post()
                .uri(finalUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestPayload)
                .retrieve()
                .body(GeminiResponse.class);

        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            throw new RuntimeException("No candidates returned in Gemini response");
        }

        GeminiResponse.Candidate candidate = response.candidates().getFirst();
        if (candidate.content() == null || candidate.content().parts() == null || candidate.content().parts().isEmpty()) {
            throw new RuntimeException("No content parts found in candidate");
        }

        return candidate.content().parts().getFirst().text();
    }
}
