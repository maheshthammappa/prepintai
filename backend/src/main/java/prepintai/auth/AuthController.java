// ─────────────────────────────────────────────────────────────────────────────
// auth/AuthController.java
//
// PURPOSE:
//   Handles all public HTTP endpoints related to user authentication.
//
// DATA FLOW:
//   1. Frontend sends a POST request to `/api/auth/register` or `/api/auth/login`.
//   2. This Controller intercepts the request body (e.g., `LoginRequest`).
//   3. It interacts with `UserRepository` to find or create the user in the database.
//   4. It uses Spring `AuthenticationManager` to verify passwords.
//   5. It uses `JwtUtils` to generate a token and returns it in an `AuthResponse`.
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.auth;

import prepintai.auth.dto.AuthResponse;
import prepintai.auth.dto.LoginRequest;
import prepintai.auth.dto.RegisterRequest;
import prepintai.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (signUpRequest.username() == null || signUpRequest.username().trim().length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username must be at least 4 characters!"));
        }
        if (signUpRequest.password() == null || signUpRequest.password().trim().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters!"));
        }
        if (signUpRequest.email() == null || !signUpRequest.email().contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email address!"));
        }

        if (userRepository.existsByUsername(signUpRequest.username())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.email())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
        }

        User user = User.builder()
                .username(signUpRequest.username().trim())
                .email(signUpRequest.email().trim())
                .password(passwordEncoder.encode(signUpRequest.password()))
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByUsername(loginRequest.username())
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));

            String token = jwtUtils.generateToken(user.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password!"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        org.springframework.security.core.userdetails.User principal = 
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        
        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "createdAt", user.getCreatedAt()
        ));
    }
}
