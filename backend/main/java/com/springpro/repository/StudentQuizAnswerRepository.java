package com.springpro.repository;

import com.springpro.entity.StudentQuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentQuizAnswerRepository extends JpaRepository<StudentQuizAnswer, Long> {
    List<StudentQuizAnswer> findByAttemptId(Long attemptId);
}
