package com.springpro.controller;

import com.springpro.dto.QuizSubmitRequest;
import com.springpro.entity.QuizQuestion;
import com.springpro.entity.Student;
import com.springpro.entity.StudentQuizAttempt;
import com.springpro.repository.QuizQuestionRepository;
import com.springpro.repository.StudentQuizAttemptRepository;
import com.springpro.repository.StudentRepository;
import com.springpro.service.StudentQuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.springpro.repository.QuizAssignmentRepository;
import com.springpro.entity.QuizAssignment;
import java.util.stream.Collectors;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students/{studentId}")
@CrossOrigin(origins = "*")
public class StudentQuizController {

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private StudentQuizService studentQuizService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentQuizAttemptRepository attemptRepository;

    @Autowired
    private QuizAssignmentRepository quizAssignmentRepository;

    // Start an assigned quiz for a student. Requires existing QuizAssignment.
    @PostMapping("/quizzes")
    public ResponseEntity<Map<String, Object>> generateQuiz(@PathVariable Long studentId,
            @RequestBody Map<String, Object> payload) {
        if (!payload.containsKey("quizId")) {
            throw new RuntimeException("Missing quizId in request payload. Students may only start assigned quizzes.");
        }
        Long quizId = Long.valueOf(payload.get("quizId").toString());
        Map<String, Object> resp = studentQuizService.startAssignedQuiz(studentId, quizId);
        return ResponseEntity.ok(resp);
    }

    // Submit quiz answers for an assigned quiz. Enforces assignment check in
    // service layer.
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<Map<String, Object>> submitQuiz(@PathVariable Long studentId, @PathVariable Long quizId,
            @RequestBody QuizSubmitRequest submission) {
        Map<String, Object> resp = studentQuizService.submitAssignedQuiz(studentId, quizId, submission);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<StudentQuizAttempt>> getAttempts(@PathVariable Long studentId) {
        return ResponseEntity.ok(attemptRepository.findByStudentId(studentId));
    }

    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getProgress(@PathVariable Long studentId) {
        List<StudentQuizAttempt> attempts = attemptRepository.findByStudentId(studentId);
        int totalAttempts = attempts.size();

        // Calculate total score including both auto-graded and manual scores
        int totalScore = attempts.stream()
                .mapToInt(a -> a.getScore() + a.getManualScore())
                .sum();

        int totalQuestions = attempts.stream()
                .mapToInt(StudentQuizAttempt::getTotalQuestions)
                .sum();

        // Calculate average score per quiz (as percentage)
        double avgScore = totalAttempts == 0 ? 0
                : attempts.stream()
                        .mapToDouble(a -> {
                            int total = a.getTotalQuestions();
                            if (total == 0)
                                return 0;
                            int score = a.getScore() + a.getManualScore();
                            return Math.min(100.0, ((double) score / total) * 100);
                        })
                        .average()
                        .orElse(0);

        // Calculate overall accuracy (capped at 100%)
        double accuracy = totalQuestions == 0 ? 0 : Math.min(100.0, ((double) totalScore / totalQuestions) * 100);

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalAttempts", totalAttempts);
        resp.put("avgScore", Math.round(avgScore));
        resp.put("accuracy", Math.round(accuracy));
        resp.put("attempts", attempts);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAssignments(@PathVariable Long studentId) {
        List<QuizAssignment> assignments = quizAssignmentRepository.findByStudentId(studentId);

        List<Map<String, Object>> resp = assignments.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            Long quizId = null;
            Long topicId = null;
            String title = null;
            String courseTitle = null;
            int questionCount = 0;
            if (a.getQuiz() != null) {
                quizId = a.getQuiz().getId();
                if (a.getQuiz().getTopic() != null) {
                    title = a.getQuiz().getTopic().getTitle();
                    topicId = a.getQuiz().getTopic().getId();
                }
                questionCount = quizQuestionRepository.findByQuizId(quizId).size();
            }
            if (a.getCourse() != null) {
                courseTitle = a.getCourse().getTitle();
            }

            // duration: estimate as number of questions (minutes) — frontend-friendly
            // number
            Integer duration = questionCount;

            m.put("quizId", quizId);
            m.put("topicId", topicId);
            m.put("title", title);
            m.put("course", courseTitle);
            m.put("duration", duration);
            m.put("status", a.getStatus());

            // Add progress/assessment info if available
            List<StudentQuizAttempt> attempts = attemptRepository.findByStudentId(studentId);
            attempts.stream()
                    .filter(att -> att.getQuiz().getId().equals(a.getQuiz().getId()))
                    .max((att1, att2) -> att1.getAttemptedAt().compareTo(att2.getAttemptedAt()))
                    .ifPresent(latest -> {
                        m.put("fullyAssessed", latest.isFullyAssessed());
                        m.put("score", latest.getScore() + latest.getManualScore());
                    });

            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }
}
