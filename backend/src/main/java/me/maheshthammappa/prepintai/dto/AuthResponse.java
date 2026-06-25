package me.maheshthammappa.prepintai.dto;

public record AuthResponse(
    String token,
    String username,
    String email
) {}
