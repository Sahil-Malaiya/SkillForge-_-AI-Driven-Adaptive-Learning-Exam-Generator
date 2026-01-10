package com.springpro.controller;

import com.springpro.dto.QuizSubmitRequest;
import com.springpro.entity.Quiz;
import com.springpro.entity.QuizQuestion;
import com.springpro.entity.Student;
import com.springpro.entity.StudentQuizAttempt;
import com.springpro.repository.QuizQuestionRepository;
import com.springpro.repository.QuizRepository;
import com.springpro.repository.StudentQuizAttemptRepository;
import com.springpro.repository.StudentRepository;
import com.springpro.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students/{studentId}")
@CrossOrigin(origins = "*")
public class StudentQuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentQuizAttemptRepository attemptRepository;

    // Generate a quiz for a student (creates Quiz + questions via existing
    // QuizService)
    @PostMapping("/quizzes")
    public ResponseEntity<Map<String, Object>> generateQuiz(@PathVariable Long studentId,
            @RequestBody Map<String, Object> payload) {
        Long topicId = Long.valueOf(payload.get("topicId").toString());
        String difficulty = (String) payload.getOrDefault("difficulty", "EASY");
        int count = payload.containsKey("count") ? Integer.parseInt(payload.get("count").toString()) : 2;

        Quiz quiz = quizService.createQuiz(topicId, difficulty, count);
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quiz.getId());

        Map<String, Object> resp = new HashMap<>();
        resp.put("quiz", quiz);
        resp.put("questions", questions);
        return ResponseEntity.ok(resp);
    }

    // Submit quiz answers
    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<Map<String, Object>> submitQuiz(@PathVariable Long studentId, @PathVariable Long quizId,
            @RequestBody QuizSubmitRequest submission) {
        // Load quiz and questions
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);

        int total = questions.size();
        int score = 0;
        for (QuizQuestion q : questions) {
            String selected = submission.getAnswers().get(q.getId());
            if (selected != null && selected.equals(q.getCorrectAnswer())) {
                score++;
            }
        }

        // Save attempt
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        StudentQuizAttempt attempt = new StudentQuizAttempt();
        attempt.setStudent(student);
        attempt.setQuiz(quiz);
        attempt.setScore(score);
        attempt.setTotalQuestions(total);
        attempt.setAttemptedAt(java.time.LocalDateTime.now());
        attemptRepository.save(attempt);

        Map<String, Object> resp = new HashMap<>();
        resp.put("score", score);
        resp.put("totalQuestions", total);
        resp.put("accuracy", total == 0 ? 0 : (score * 100) / total);
        resp.put("attemptId", attempt.getId());
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
        int totalScore = attempts.stream().mapToInt(StudentQuizAttempt::getScore).sum();
        int totalQuestions = attempts.stream().mapToInt(StudentQuizAttempt::getTotalQuestions).sum();

        double avgScore = totalAttempts == 0 ? 0 : ((double) totalScore) / totalAttempts;
        double accuracy = totalQuestions == 0 ? 0 : ((double) totalScore * 100) / totalQuestions;

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalAttempts", totalAttempts);
        resp.put("avgScore", avgScore);
        resp.put("accuracy", accuracy);
        resp.put("attempts", attempts);
        return ResponseEntity.ok(resp);
    }
}
