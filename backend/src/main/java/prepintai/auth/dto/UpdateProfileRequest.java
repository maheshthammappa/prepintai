package prepintai.auth.dto;

public record UpdateProfileRequest(
        String username,
        String email,
        String bio
) {
}
