package com.springpro.service;

import com.springpro.entity.Quiz;
import com.springpro.entity.Topic;
import com.springpro.repository.QuizRepository;
import com.springpro.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private TopicRepository topicRepository;

    public Quiz createQuiz(Long topicId, String difficulty) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id " + topicId));

        Quiz quiz = new Quiz();
        quiz.setQuizId(UUID.randomUUID().toString());
        quiz.setTopic(topic);
        quiz.setDifficulty(difficulty);

        return quizRepository.save(quiz);
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public List<Quiz> getQuizzesByTopic(Long topicId) {
        return quizRepository.findByTopicId(topicId);
    }
}
