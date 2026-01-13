package com.springpro.service;

import com.springpro.entity.StudentQuizAnswer;
import com.springpro.entity.StudentQuizAttempt;
import com.springpro.repository.StudentQuizAnswerRepository;
import com.springpro.repository.StudentQuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class InstructorSubmissionService {

    @Autowired
    private StudentQuizAttemptRepository attemptRepository;

    @Autowired
    private StudentQuizAnswerRepository answerRepository;

    public List<StudentQuizAttempt> getUngradedAttempts() {
        return attemptRepository.findByFullyAssessedFalse();
    }

    public List<StudentQuizAnswer> getAnswersToGrade(Long attemptId) {
        return answerRepository.findByAttemptId(attemptId);
    }

    public StudentQuizAttempt gradeAttempt(Long attemptId, Map<Long, Integer> marks) {
        StudentQuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        int manualScore = 0;
        List<StudentQuizAnswer> answers = answerRepository.findByAttemptId(attemptId);

        for (StudentQuizAnswer answer : answers) {
            if (marks.containsKey(answer.getId())) {
                int mark = marks.get(answer.getId());
                answer.setMarksObtained(mark);
                answer.setGraded(true);
                answerRepository.save(answer);
            }
            if (answer.getMarksObtained() != null
                    && answer.getQuestion().getType() == com.springpro.entity.QuestionType.SAQ) {
                manualScore += answer.getMarksObtained();
            }
        }

        attempt.setManualScore(manualScore);
        attempt.setFullyAssessed(true);
        return attemptRepository.save(attempt);
    }
}
