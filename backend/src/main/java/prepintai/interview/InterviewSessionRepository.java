// ─────────────────────────────────────────────────────────────────────────────
// interview/InterviewSessionRepository.java
//
// PURPOSE:
//   The Spring Data JPA Repository for fetching and saving interview sessions.
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.interview;

import prepintai.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    
    /**
     * Retrieve all interview sessions ordered by their creation time descending.
     */
    List<InterviewSession> findAllByOrderByCreatedAtDesc();

    /**
     * Retrieve all interview sessions for a specific user ordered by creation time descending.
     */
    List<InterviewSession> findAllByUserOrderByCreatedAtDesc(User user);
}
