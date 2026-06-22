package me.maheshthammappa.prepintai.dto;

import java.util.List;

public record QuestionResponse(
    String topic,
    String experienceLevel,
    List<QuestionEntry> questions
) {}
