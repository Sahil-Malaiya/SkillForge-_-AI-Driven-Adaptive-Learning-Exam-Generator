package com.springpro.repository;

import com.springpro.entity.QuizAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAssignmentRepository extends JpaRepository<QuizAssignment, Long> {
    List<QuizAssignment> findByStudentId(Long studentId);

    boolean existsByQuizIdAndStudentId(Long quizId, Long studentId);
}
