package com.springpro.service;

import com.springpro.dto.QuizQuestionDTO;
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
import com.springpro.dto.QuizQuestionDTO;
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

    // Start an assigned quiz for a student. Enforces assignment check and returns
    // quiz + questions.
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

        List<QuizQuestionDTO> questions = quizQuestionRepository
                .findByQuizId(quizId)
                .stream()
                .map(q -> {
                    QuizQuestionDTO dto = new QuizQuestionDTO();
                    dto.setId(q.getId());
                    dto.setQuestion(q.getQuestion());
                    dto.setOptionA(q.getOptionA());
                    dto.setOptionB(q.getOptionB());
                    dto.setOptionC(q.getOptionC());
                    dto.setOptionD(q.getOptionD());
                    return dto;
                })
                .toList();

        Map<String, Object> resp = new HashMap<>();
        resp.put("quizId", quizId);
        resp.put("questions", questions);
        return resp;
    }

    @Autowired
    private com.springpro.repository.StudentQuizAnswerRepository answerRepository;

    // Submit answers for an assigned quiz. Enforces assignment check and creates
    // attempt record.
    public Map<String, Object> submitAssignedQuiz(Long studentId, Long quizId, QuizSubmitRequest submission) {
        if (!quizAssignmentRepository.existsByQuizIdAndStudentId(quizId, studentId)) {
            throw new RuntimeException("Quiz not assigned to this student");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizId(quizId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudentQuizAttempt attempt = new StudentQuizAttempt();
        attempt.setStudent(student);
        com.springpro.entity.Quiz qref = new com.springpro.entity.Quiz();
        qref.setId(quizId);
        attempt.setQuiz(qref);
        attempt.setAttemptedAt(LocalDateTime.now());
        attempt.setTotalQuestions(questions.size());

        // Save attempt first to get ID for answers
        final StudentQuizAttempt savedAttempt = attemptRepository.save(attempt);

        int mcqScore = 0;
        boolean hasSAQ = false;

        for (QuizQuestion q : questions) {
            String selected = submission.getAnswers().get(q.getId());

            com.springpro.entity.StudentQuizAnswer answer = new com.springpro.entity.StudentQuizAnswer();
            answer.setAttempt(savedAttempt);
            answer.setQuestion(q);
            answer.setAnswerText(selected);

            if (q.getType() == com.springpro.entity.QuestionType.MCQ) {
                if (selected != null && selected.equals(q.getCorrectAnswer())) {
                    mcqScore++;
                    answer.setMarksObtained(1);
                } else {
                    answer.setMarksObtained(0);
                }
                answer.setGraded(true);
            } else {
                hasSAQ = true;
                answer.setGraded(false);
                answer.setMarksObtained(null); // To be graded by instructor
            }
            answerRepository.save(answer);
        }

        savedAttempt.setScore(mcqScore);
        savedAttempt.setFullyAssessed(!hasSAQ);
        attemptRepository.save(savedAttempt);

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
        resp.put("score", mcqScore);
        resp.put("totalQuestions", questions.size());
        resp.put("accuracy", questions.size() == 0 ? 0 : (mcqScore * 100) / questions.size());
        resp.put("attemptId", savedAttempt.getId());
        resp.put("fullyAssessed", !hasSAQ);
        return resp;
    }
}
