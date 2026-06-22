package me.maheshthammappa.prepintai.dto;

public record QuestionGenRequest(
    String topic,
    String experienceLevel,
    Integer questionCount
) {}
