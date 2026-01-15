package com.springpro.service;

import com.springpro.entity.Course;
import com.springpro.entity.Quiz;
import com.springpro.entity.QuizAssignment;
import com.springpro.entity.QuizQuestion;
import com.springpro.entity.QuestionType;
import com.springpro.entity.Topic;
import com.springpro.repository.QuizAssignmentRepository;
import com.springpro.repository.QuizQuestionRepository;
import com.springpro.repository.QuizRepository;
import com.springpro.repository.StudentRepository;
import com.springpro.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private com.springpro.repository.StudentQuizAttemptRepository attemptRepository;
    @Autowired
    private GeminiService geminiService;

    public Quiz createQuiz(Long topicId, String difficulty, int countMCQ, int countSAQ) {

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id " + topicId));

        // Create quiz record
        Quiz quiz = new Quiz();
        quiz.setTopic(topic);
        quiz.setDifficulty(difficulty);

        quiz = quizRepository.save(quiz);

        org.json.JSONArray questions = null;

        try {
            // Try to generate questions using Gemini AI
            System.out.println(
                    "Calling Gemini for topic: " + topic.getTitle() + ", difficulty: " + difficulty +
                            ", countMCQ: " + countMCQ + ", countSAQ: " + countSAQ);
            questions = geminiService.generateQuiz(topic.getTitle(), difficulty, countMCQ, countSAQ);
            System.out.println("Gemini returned " + questions.length() + " questions");
        } catch (Exception e) {
            // Fallback: Generate sample questions if Gemini API fails
            System.err.println("Gemini API failed, using fallback sample questions: " + e.getMessage());
            questions = generateFallbackQuestions(topic.getTitle(), difficulty, countMCQ, countSAQ);
            System.out.println("Generated " + questions.length() + " fallback questions");
        }

        for (int i = 0; i < questions.length(); i++) {

            var q = questions.getJSONObject(i);

            QuizQuestion qq = new QuizQuestion();
            qq.setQuiz(quiz);
            qq.setQuestion(q.getString("question"));

            // Set type
            String typeStr = q.optString("type", "MCQ");
            QuestionType type = QuestionType.valueOf(typeStr.toUpperCase());
            qq.setType(type);

            if (type == QuestionType.MCQ) {
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
            } else {
                // For SAQ, options and correctAnswer are not preset by Gemini
                // correct answer for SAQ would be manually graded or could have a sample answer
                // but per user request, just the question for SAQ.
                qq.setOptionA(null);
                qq.setOptionB(null);
                qq.setOptionC(null);
                qq.setOptionD(null);
                qq.setCorrectAnswer(null);
            }

            quizQuestionRepository.save(qq);
        }

        return quiz;
    }

    private org.json.JSONArray generateFallbackQuestions(String topicName, String difficulty, int countMCQ,
            int countSAQ) {
        org.json.JSONArray questions = new org.json.JSONArray();

        // Generate MCQ questions
        for (int i = 0; i < countMCQ; i++) {
            org.json.JSONObject q = new org.json.JSONObject();
            q.put("type", "MCQ");
            q.put("question", "Sample question " + (i + 1) + " about " + topicName + " (" + difficulty + " level)");

            org.json.JSONArray options = new org.json.JSONArray();
            options.put("Option A: Sample answer");
            options.put("Option B: Sample answer");
            options.put("Option C: Sample answer");
            options.put("Option D: Sample answer");
            q.put("options", options);
            q.put("answer", "A");

            questions.put(q);
        }

        // Generate SAQ questions
        for (int i = 0; i < countSAQ; i++) {
            org.json.JSONObject q = new org.json.JSONObject();
            q.put("type", "SAQ");
            q.put("question",
                    "Short answer question " + (i + 1) + " about " + topicName + " (" + difficulty + " level)");
            questions.put(q);
        }

        return questions;
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public List<Quiz> getQuizzesByTopic(Long topicId) {
        return quizRepository.findByTopicId(topicId);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id " + id));

        // Let JPA/Hibernate cascade-delete related assignments, questions, attempts and answers
        quizRepository.delete(quiz);
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
