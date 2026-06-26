package prepintai.interview.dto;

import java.util.List;

public record AnswerSubmission(
    String topic,
    String experienceLevel,
    List<AnswerEntry> answers
) {}
