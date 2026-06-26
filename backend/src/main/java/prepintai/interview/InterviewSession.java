// ─────────────────────────────────────────────────────────────────────────────
// interview/InterviewSession.java
//
// PURPOSE:
//   The JPA Entity representing a completed mock interview session.
//   Maps to the `interview_sessions` table.
//
// DATA FLOW:
//   - A user finishes an interview and clicks "Submit".
//   - The backend evaluates it, creates this entity, and saves it.
//   - When the user visits `/history`, this entity is retrieved.
// ─────────────────────────────────────────────────────────────────────────────
package prepintai.interview;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import prepintai.auth.User;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private String experienceLevel;

    @Column(nullable = false)
    private int overallScore;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String overallSummary;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "session_strengths", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "strength", columnDefinition = "TEXT")
    private List<String> strengths = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "session_weaknesses", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "weakness", columnDefinition = "TEXT")
    private List<String> weaknesses = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "session_improvements", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "improvement", columnDefinition = "TEXT")
    private List<String> improvementSuggestions = new ArrayList<>();

    @OneToMany(mappedBy = "interviewSession", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<QuestionEvaluationEntity> evaluations = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore
    private User user;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
