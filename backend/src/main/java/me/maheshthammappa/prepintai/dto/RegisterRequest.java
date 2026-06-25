package me.maheshthammappa.prepintai.dto;

public record RegisterRequest(
    String username,
    String email,
    String password
) {}
