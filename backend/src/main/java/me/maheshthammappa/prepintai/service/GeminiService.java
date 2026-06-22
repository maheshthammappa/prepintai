package me.maheshthammappa.prepintai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import me.maheshthammappa.prepintai.dto.AnswerSubmission;
import me.maheshthammappa.prepintai.dto.InterviewReport;
import me.maheshthammappa.prepintai.dto.QuestionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public GeminiService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    /**
     * Helper record schemas for the Gemini API Request
     */
    private record GeminiRequest(List<Content> contents, GenerationConfig generationConfig) {
        private record Content(List<Part> parts) {}
        private record Part(String text) {}
        private record GenerationConfig(String responseMimeType) {}
    }

    /**
     * Helper record schemas for the Gemini API Response
     */
    private record GeminiResponse(List<Candidate> candidates) {
        private record Candidate(Content content) {}
        private record Content(List<Part> parts) {}
        private record Part(String text) {}
    }

    /**
     * Calls Gemini API to generate the requested number of interview questions on a topic.
     */
    public QuestionResponse generateQuestions(String topic, String experienceLevel, int questionCount) {
        String prompt = String.format(
            "You are an expert technical interviewer.\n" +
            "Generate exactly %d interview questions for the topic: \"%s\" and experience level: \"%s\".\n" +
            "The questions should cover deep conceptual, syntactical, framework design, performance tuning, and architectural scenarios.\n" +
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
            "Evaluate the candidate's responses. Provide a question-by-question evaluation. For each question, determine a score (0-100), give comprehensive feedback pointing out correct aspects and gaps, and a single high-quality \"suggestedAnswer\" combining the best way to answer it with code samples/guidelines if relevant.\n" +
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
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate interview from Gemini: " + e.getMessage(), e);
        }
    }

    /**
     * Executes POST request to Gemini REST API and extracts the raw JSON text response.
     */
    private String callGeminiApi(String prompt) {
        String finalUrl = geminiApiUrl + "?key=" + geminiApiKey;

        // Build Payload matching Gemini structure
        GeminiRequest.Part part = new GeminiRequest.Part(prompt);
        GeminiRequest.Content content = new GeminiRequest.Content(List.of(part));
        GeminiRequest.GenerationConfig config = new GeminiRequest.GenerationConfig("application/json");
        GeminiRequest requestPayload = new GeminiRequest(List.of(content), config);

        try {
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

        } catch (Exception e) {
            throw new RuntimeException("Error communicating with Gemini API: " + e.getMessage(), e);
        }
    }
}
