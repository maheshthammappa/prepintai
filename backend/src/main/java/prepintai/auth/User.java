// ─────────────────────────────────────────────────────────────────────────────
// auth/User.java
//
// PURPOSE:
//   The JPA Entity representing a registered user in the database.
//   Maps directly to the `users` table.
//
// DATA FLOW:
//   - When a user registers, a new `User` object is instantiated, the password
//     is encrypted, and it is saved via `UserRepository`.
//   - When a user logs in, Spring Security retrieves this entity to check credentials.
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
