package prepintai.interview.dto;

import java.time.LocalDateTime;

public record InterviewHistorySummary(
    Long id,
    String topic,
    String experienceLevel,
    int overallScore,
    LocalDateTime createdAt
) {}
