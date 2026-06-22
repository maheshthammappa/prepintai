package me.maheshthammappa.prepintai.controller;

import me.maheshthammappa.prepintai.dto.AnswerSubmission;
import me.maheshthammappa.prepintai.dto.InterviewReport;
import me.maheshthammappa.prepintai.dto.QuestionGenRequest;
import me.maheshthammappa.prepintai.dto.QuestionResponse;
import me.maheshthammappa.prepintai.service.GeminiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final GeminiService geminiService;

    public InterviewController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/generate")
    public QuestionResponse generateQuestions(@RequestBody QuestionGenRequest request) {
        int count = (request.questionCount() == null || request.questionCount() <= 0) ? 10 : request.questionCount();
        return geminiService.generateQuestions(request.topic(), request.experienceLevel(), count);
    }

    @PostMapping("/evaluate")
    public InterviewReport evaluateInterview(@RequestBody AnswerSubmission submission) {
        return geminiService.evaluateInterview(submission);
    }
}
