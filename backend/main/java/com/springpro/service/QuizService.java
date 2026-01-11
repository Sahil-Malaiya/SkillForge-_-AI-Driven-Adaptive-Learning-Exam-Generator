package com.springpro.service;

import com.springpro.entity.Course;
import com.springpro.entity.Quiz;
import com.springpro.entity.QuizAssignment;
import com.springpro.entity.QuizQuestion;
import com.springpro.entity.Topic;
import com.springpro.repository.QuizAssignmentRepository;
import com.springpro.repository.QuizQuestionRepository;
import com.springpro.repository.QuizRepository;
import com.springpro.repository.StudentRepository;
import com.springpro.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizAssignmentRepository quizAssignmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GeminiService geminiService;

    public Quiz createQuiz(Long topicId, String difficulty, int count) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id " + topicId));

        // Create quiz record
        Quiz quiz = new Quiz();
        quiz.setTopic(topic);
        quiz.setDifficulty(difficulty);

        quiz = quizRepository.save(quiz);

        // Generate questions using Gemini AI
        System.out.println(
                "Calling Gemini for topic: " + topic.getTitle() + ", difficulty: " + difficulty + ", count: " + count);
        org.json.JSONArray questions = geminiService.generateMCQ(topic.getTitle(), difficulty, count);
        System.out.println("Gemini returned " + questions.length() + " questions");

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

            // Normalize correct answer to just the letter (A/B/C/D)
            String correctAnswer = q.getString("answer").trim().toUpperCase();
            // Extract just the first character if it's A, B, C, or D
            if (correctAnswer.length() > 0) {
                char firstChar = correctAnswer.charAt(0);
                if (firstChar == 'A' || firstChar == 'B' || firstChar == 'C' || firstChar == 'D') {
                    correctAnswer = String.valueOf(firstChar);
                }
            }
            qq.setCorrectAnswer(correctAnswer);

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

    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }

    public List<QuizQuestion> getQuestionsByQuizId(Long quizId) {
        return quizQuestionRepository.findByQuizId(quizId);
    }

    public QuizQuestion createQuestion(Long quizId, QuizQuestion question) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id " + quizId));
        question.setQuiz(quiz);
        return quizQuestionRepository.save(question);
    }

    public QuizQuestion updateQuestion(Long questionId, QuizQuestion updatedQuestion) {
        QuizQuestion existing = quizQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id " + questionId));
        existing.setQuestion(updatedQuestion.getQuestion());
        existing.setOptionA(updatedQuestion.getOptionA());
        existing.setOptionB(updatedQuestion.getOptionB());
        existing.setOptionC(updatedQuestion.getOptionC());
        existing.setOptionD(updatedQuestion.getOptionD());
        existing.setCorrectAnswer(updatedQuestion.getCorrectAnswer());
        return quizQuestionRepository.save(existing);
    }

    public void deleteQuestion(Long questionId) {
        quizQuestionRepository.deleteById(questionId);
    }

    public List<com.springpro.entity.Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public void assignQuizToStudents(Long quizId, List<Long> studentIds) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        for (Long studentId : studentIds) {
            com.springpro.entity.Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (!quizAssignmentRepository.existsByQuizIdAndStudentId(quizId, studentId)) {
                QuizAssignment assignment = new QuizAssignment(quiz, student);
                quizAssignmentRepository.save(assignment);
            }
        }
    }

    public void assignQuizToAllStudents(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<com.springpro.entity.Student> allStudents = studentRepository.findAll();
        for (com.springpro.entity.Student student : allStudents) {
            if (!quizAssignmentRepository.existsByQuizIdAndStudentId(quizId, student.getId())) {
                // QuizAssignment assignment = new QuizAssignment(quiz, student);
                Course course = null;
                QuizAssignment assignment = new QuizAssignment(quiz, student, course);

                quizAssignmentRepository.save(assignment);
            }
        }
    }
}
