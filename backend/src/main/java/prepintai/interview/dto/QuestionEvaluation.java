package prepintai.interview.dto;

public record QuestionEvaluation(
    int questionId,
    String questionText,
    String userAnswer,
    int score,
    String feedback,
    String suggestedAnswer
) {}
