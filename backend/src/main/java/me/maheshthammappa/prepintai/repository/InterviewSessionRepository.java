package me.maheshthammappa.prepintai.repository;

import me.maheshthammappa.prepintai.entity.InterviewSession;
import me.maheshthammappa.prepintai.entity.User;
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
