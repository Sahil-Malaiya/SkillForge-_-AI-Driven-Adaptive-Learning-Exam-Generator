package com.springpro.repository;

import com.springpro.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
	java.util.List<QuizQuestion> findByQuizId(Long quizId);

}
