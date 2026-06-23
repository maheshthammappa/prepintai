package me.maheshthammappa.prepintai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import me.maheshthammappa.prepintai.dto.QuestionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class GeminiServiceTest {

    private RestClient restClient;
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;
    private RestClient.RequestBodySpec requestBodySpec;
    private RestClient.ResponseSpec responseSpec;
    private ObjectMapper objectMapper;
    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        restClient = mock(RestClient.class);
        requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class);
        requestBodySpec = mock(RestClient.RequestBodySpec.class);
        responseSpec = mock(RestClient.ResponseSpec.class);
        objectMapper = new ObjectMapper();

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any(MediaType.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(Object.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);

        geminiService = new GeminiService(restClient, objectMapper);
        ReflectionTestUtils.setField(geminiService, "geminiApiUrl", "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent");
        ReflectionTestUtils.setField(geminiService, "geminiApiKey", "dummy-key");
    }

    @Test
    void testSuccessfulCallOnFirstAttempt() throws Exception {
        // Arrange
        String mockResponseJson = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"{\\\"topic\\\":\\\"Java\\\",\\\"experienceLevel\\\":\\\"Junior\\\",\\\"questions\\\":[]}\"}]}}]}";
        GeminiService.GeminiResponse responseObj = objectMapper.readValue(mockResponseJson, GeminiService.GeminiResponse.class);
        when(responseSpec.body(GeminiService.GeminiResponse.class)).thenReturn(responseObj);

        // Act
        QuestionResponse result = geminiService.generateQuestions("Java", "Junior", 5);

        // Assert
        assertNotNull(result);
        assertEquals("Java", result.topic());
        assertEquals("Junior", result.experienceLevel());
        verify(restClient, times(1)).post();
    }

    @Test
    void testRetryForTemporaryErrorsAndThenSucceed() throws Exception {
        // Arrange
        // Simulate a 429 Too Many Requests error on the first call, and success on the second.
        HttpClientErrorException exception429 = HttpClientErrorException.create(
                HttpStatus.TOO_MANY_REQUESTS, 
                "Too Many Requests", 
                org.springframework.http.HttpHeaders.EMPTY, 
                new byte[0], 
                StandardCharsets.UTF_8
        );

        String mockResponseJson = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"{\\\"topic\\\":\\\"Java\\\",\\\"experienceLevel\\\":\\\"Junior\\\",\\\"questions\\\":[]}\"}]}}]}";
        GeminiService.GeminiResponse responseObj = objectMapper.readValue(mockResponseJson, GeminiService.GeminiResponse.class);

        when(responseSpec.body(GeminiService.GeminiResponse.class))
                .thenThrow(exception429)
                .thenReturn(responseObj);

        // Act
        QuestionResponse result = geminiService.generateQuestions("Java", "Junior", 5);

        // Assert
        assertNotNull(result);
        assertEquals("Java", result.topic());
        verify(restClient, times(2)).post();
    }

    @Test
    void testMaxRetriesExhaustedThrowsGeminiServiceException() {
        // Arrange
        // Simulate 503 Service Unavailable for all 4 attempts
        HttpServerErrorException exception503 = HttpServerErrorException.create(
                HttpStatus.SERVICE_UNAVAILABLE, 
                "Service Unavailable", 
                org.springframework.http.HttpHeaders.EMPTY, 
                new byte[0], 
                StandardCharsets.UTF_8
        );

        when(responseSpec.body(GeminiService.GeminiResponse.class))
                .thenThrow(exception503);

        // Act & Assert
        GeminiServiceException ex = assertThrows(GeminiServiceException.class, () -> {
            geminiService.generateQuestions("Java", "Junior", 5);
        });

        assertEquals("The AI service is currently experiencing high demand. Please try again in a few moments.", ex.getMessage());
        verify(restClient, times(4)).post();
    }

    @Test
    void testNonRetryableErrorsDoNotRetry() {
        // Arrange
        // Simulate a 400 Bad Request error
        HttpClientErrorException exception400 = HttpClientErrorException.create(
                HttpStatus.BAD_REQUEST, 
                "Bad Request", 
                org.springframework.http.HttpHeaders.EMPTY, 
                new byte[0], 
                StandardCharsets.UTF_8
        );

        when(responseSpec.body(GeminiService.GeminiResponse.class))
                .thenThrow(exception400);

        // Act & Assert
        GeminiServiceException ex = assertThrows(GeminiServiceException.class, () -> {
            geminiService.generateQuestions("Java", "Junior", 5);
        });

        assertTrue(ex.getMessage().contains("Error communicating with Gemini API"));
        verify(restClient, times(1)).post();
    }
}
