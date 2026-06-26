package prepintai.interview.dto;

import java.util.List;

public record InterviewReport(
    int overallScore,
    String overallSummary,
    List<String> strengths,
    List<String> weaknesses,
    List<String> improvementSuggestions,
    List<QuestionEvaluation> evaluations
) {}
