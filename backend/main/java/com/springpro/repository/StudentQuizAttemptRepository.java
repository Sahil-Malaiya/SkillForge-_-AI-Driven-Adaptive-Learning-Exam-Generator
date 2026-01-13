package com.springpro.repository;

import com.springpro.entity.StudentQuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentQuizAttemptRepository extends JpaRepository<StudentQuizAttempt, Long> {

    List<StudentQuizAttempt> findByStudentId(Long studentId);

    List<StudentQuizAttempt> findByFullyAssessedFalse();
    
    // Check whether any attempts exist for a given quiz id
    boolean existsByQuizId(Long quizId);
}
