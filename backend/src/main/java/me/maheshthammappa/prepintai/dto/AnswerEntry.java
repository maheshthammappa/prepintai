package me.maheshthammappa.prepintai.dto;

public record AnswerEntry(
    int questionId,
    String questionText,
    String userAnswer
) {}
