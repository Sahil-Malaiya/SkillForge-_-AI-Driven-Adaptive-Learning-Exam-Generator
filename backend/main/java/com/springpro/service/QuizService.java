package com.springpro.service;

import com.springpro.entity.Quiz;
import com.springpro.entity.QuizQuestion;
import com.springpro.entity.Topic;
import com.springpro.repository.QuizQuestionRepository;
import com.springpro.repository.QuizRepository;
import com.springpro.repository.TopicRepository;
import org.json.JSONArray;
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

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private OllamaService ollamaService;

    public Quiz createQuiz(Long topicId, String difficulty) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id " + topicId));

        // Create quiz record
        Quiz quiz = new Quiz();
        quiz.setQuizId(UUID.randomUUID().toString());
        quiz.setTopic(topic);
        quiz.setDifficulty(difficulty);

        quiz = quizRepository.save(quiz);

        // Generate questions using AI
        org.json.JSONArray questions = ollamaService.generateMCQ(topic.getTitle(), difficulty);

        for (int i = 0; i < questions.length(); i++) {

            var q = questions.getJSONObject(i);

            QuizQuestion qq = new QuizQuestion();
            qq.setQuiz(quiz);
            qq.setQuestion(q.getString("question"));

            var opts = q.getJSONArray("options");

            qq.setOptionA(opts.getString(0));
            qq.setOptionB(opts.getString(1));
            qq.setOptionC(opts.getString(2));
            qq.setOptionD(opts.getString(3));

            qq.setCorrectAnswer(q.getString("answer"));

            quizQuestionRepository.save(qq);
        }

        return quiz;
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public List<Quiz> getQuizzesByTopic(Long topicId) {
        return quizRepository.findByTopicId(topicId);
    }
}
