package com.springpro.service;

import com.springpro.dto.QuizSubmitRequest;
import com.springpro.entity.QuizAssignment;
import com.springpro.entity.QuizQuestion;
import com.springpro.entity.Student;
import com.springpro.entity.StudentQuizAttempt;
import com.springpro.repository.QuizAssignmentRepository;
import com.springpro.repository.QuizQuestionRepository;
import com.springpro.repository.StudentQuizAttemptRepository;
import com.springpro.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudentQuizService {

    @Autowired
    private QuizAssignmentRepository quizAssignmentRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentQuizAttemptRepository attemptRepository;

    // Start an assigned quiz for a student. Enforces assignment check and returns quiz + questions.
    public Map<String, Object> startAssignedQuiz(Long studentId, Long quizId) {
        if (!quizAssignmentRepository.existsByQuizIdAndStudentId(quizId, studentId)) {
            throw new RuntimeException("Quiz not assigned to this student");
        }

        // Fetch assignment to update status if needed
        List<QuizAssignment> assignments = quizAssignmentRepository.findByStudentId(studentId);
        QuizAssignment matched = assignments.stream()
                .filter(a -> a.getQuiz() != null && a.getQuiz().getId().equals(quizId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Quiz assignment not found"));

        matched.setStatus(com.springpro.entity.AssignmentStatus.IN_PROGRESS);
        quizAssignmentRepository.save(matched);

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);

        Map<String, Object> resp = new HashMap<>();
        resp.put("quizId", quizId);
        resp.put("questions", questions);
        return resp;
    }

    // Submit answers for an assigned quiz. Enforces assignment check and creates attempt record.
    public Map<String, Object> submitAssignedQuiz(Long studentId, Long quizId, QuizSubmitRequest submission) {
        if (!quizAssignmentRepository.existsByQuizIdAndStudentId(quizId, studentId)) {
            throw new RuntimeException("Quiz not assigned to this student");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);

        int total = questions.size();
        int score = 0;
        for (QuizQuestion q : questions) {
            String selected = submission.getAnswers().get(q.getId());
            if (selected != null && selected.equals(q.getCorrectAnswer())) {
                score++;
            }
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudentQuizAttempt attempt = new StudentQuizAttempt();
        attempt.setStudent(student);

        // Do not reference QuizRepository directly. Store only quizId in the attempt if mapping requires it.
        com.springpro.entity.Quiz qref = new com.springpro.entity.Quiz();
        qref.setId(quizId);
        attempt.setQuiz(qref);

        attempt.setScore(score);
        attempt.setTotalQuestions(total);
        attempt.setAttemptedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        // Mark assignment as completed
        // Mark assignment as submitted
List<QuizAssignment> assignments = quizAssignmentRepository.findByStudentId(studentId);
assignments.stream()
        .filter(a -> a.getQuiz() != null && a.getQuiz().getId().equals(quizId))
        .findFirst()
        .ifPresent(a -> {
            a.setStatus(com.springpro.entity.AssignmentStatus.SUBMITTED);
            quizAssignmentRepository.save(a);
        });

        Map<String, Object> resp = new HashMap<>();
        resp.put("score", score);
        resp.put("totalQuestions", total);
        resp.put("accuracy", total == 0 ? 0 : (score * 100) / total);
        resp.put("attemptId", attempt.getId());
        return resp;
    }
}
