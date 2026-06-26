// ─────────────────────────────────────────────────────────────────────────────
// auth/UserRepository.java
//
// PURPOSE:
//   The Spring Data JPA Repository for performing database operations on Users.
//
// DATA FLOW:
//   - Provides built-in methods like `save()`.
//   - Defines custom query methods like `findByUsername()` which translates
//     into `SELECT * FROM users WHERE username = ?` automatically.
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.auth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
