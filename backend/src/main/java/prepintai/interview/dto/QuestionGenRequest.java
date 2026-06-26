package prepintai.interview.dto;

public record QuestionGenRequest(
    String topic,
    String experienceLevel,
    Integer questionCount
) {}
