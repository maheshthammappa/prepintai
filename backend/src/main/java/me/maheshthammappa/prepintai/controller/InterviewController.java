package me.maheshthammappa.prepintai.controller;

import me.maheshthammappa.prepintai.dto.AnswerSubmission;
import me.maheshthammappa.prepintai.dto.InterviewHistorySummary;
import me.maheshthammappa.prepintai.dto.InterviewReport;
import me.maheshthammappa.prepintai.dto.QuestionGenRequest;
import me.maheshthammappa.prepintai.dto.QuestionResponse;
import me.maheshthammappa.prepintai.entity.InterviewSession;
import me.maheshthammappa.prepintai.entity.QuestionEvaluationEntity;
import me.maheshthammappa.prepintai.repository.InterviewSessionRepository;
import me.maheshthammappa.prepintai.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import java.util.List;
import java.util.stream.Collectors;
import me.maheshthammappa.prepintai.entity.User;
import me.maheshthammappa.prepintai.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final GeminiService geminiService;
    private final InterviewSessionRepository interviewSessionRepository;
    private final UserRepository userRepository;

    public InterviewController(GeminiService geminiService, 
                               InterviewSessionRepository interviewSessionRepository,
                               UserRepository userRepository) {
        this.geminiService = geminiService;
        this.interviewSessionRepository = interviewSessionRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("Unauthorized access");
        }
        
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof org.springframework.security.core.userdetails.User) {
            username = ((org.springframework.security.core.userdetails.User) principal).getUsername();
        } else {
            username = principal.toString();
        }
        
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @PostMapping("/generate")
    public QuestionResponse generateQuestions(@RequestBody QuestionGenRequest request) {
        int count = (request.questionCount() == null || request.questionCount() <= 0) ? 10 : request.questionCount();
        return geminiService.generateQuestions(request.topic(), request.experienceLevel(), count);
    }

    @PostMapping(value = "/generate-from-resume", consumes = {"multipart/form-data"})
    public QuestionResponse generateQuestionsFromResume(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "resumeText", required = false) String resumeTextParam,
            @RequestParam("experienceLevel") String experienceLevel,
            @RequestParam("questionCount") int questionCount) {

        String resumeText = "";
        if (file != null && !file.isEmpty()) {
            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            if ((contentType != null && contentType.equalsIgnoreCase("application/pdf"))
                    || (originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf"))) {
                try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    resumeText = stripper.getText(document);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to parse PDF resume file: " + e.getMessage(), e);
                }
            } else {
                try {
                    resumeText = new String(file.getBytes(), StandardCharsets.UTF_8);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to read text resume file: " + e.getMessage(), e);
                }
            }
        } else if (resumeTextParam != null && !resumeTextParam.trim().isEmpty()) {
            resumeText = resumeTextParam;
        } else {
            throw new IllegalArgumentException("Either resume file or resume text must be provided.");
        }

        return geminiService.generateQuestionsFromResume(resumeText, experienceLevel, questionCount);
    }

    @PostMapping("/evaluate")
    public InterviewSession evaluateInterview(@RequestBody AnswerSubmission submission) {
        User user = getAuthenticatedUser();

        // 1. Run evaluation with Gemini API
        InterviewReport report = geminiService.evaluateInterview(submission);

        // 2. Map report to InterviewSession entity
        InterviewSession session = new InterviewSession();
        session.setTopic(submission.topic());
        session.setExperienceLevel(submission.experienceLevel());
        session.setOverallScore(report.overallScore());
        session.setOverallSummary(report.overallSummary());
        session.setStrengths(report.strengths());
        session.setWeaknesses(report.weaknesses());
        session.setImprovementSuggestions(report.improvementSuggestions());
        session.setUser(user);

        List<QuestionEvaluationEntity> evaluations = report.evaluations().stream()
                .map(eval -> {
                    QuestionEvaluationEntity entity = new QuestionEvaluationEntity();
                    entity.setInterviewSession(session);
                    entity.setQuestionId(eval.questionId());
                    entity.setQuestionText(eval.questionText());
                    entity.setUserAnswer(eval.userAnswer());
                    entity.setScore(eval.score());
                    entity.setFeedback(eval.feedback());
                    entity.setSuggestedAnswer(eval.suggestedAnswer());
                    return entity;
                })
                .collect(Collectors.toList());

        session.setEvaluations(evaluations);

        // 3. Persist to database
        return interviewSessionRepository.save(session);
    }

    @GetMapping("/history")
    public List<InterviewHistorySummary> getInterviewHistory() {
        User user = getAuthenticatedUser();
        return interviewSessionRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(session -> new InterviewHistorySummary(
                        session.getId(),
                        session.getTopic(),
                        session.getExperienceLevel(),
                        session.getOverallScore(),
                        session.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<InterviewSession> getInterviewHistoryDetail(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        return interviewSessionRepository.findById(id)
                .map(session -> {
                    if (session.getUser() != null && !session.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).<InterviewSession>build();
                    }
                    return ResponseEntity.ok(session);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

