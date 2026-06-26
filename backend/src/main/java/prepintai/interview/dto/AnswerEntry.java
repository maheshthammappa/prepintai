package prepintai.interview.dto;

public record AnswerEntry(
    int questionId,
    String questionText,
    String userAnswer
) {}
