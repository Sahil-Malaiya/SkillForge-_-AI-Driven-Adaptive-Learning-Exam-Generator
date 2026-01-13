package com.springpro.controller;

import com.springpro.entity.Quiz;
import com.springpro.entity.Student;
import com.springpro.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructor/quizzes")
@CrossOrigin(origins = "*") // Allow frontend access
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Map<String, Object> payload) {
        System.out.println("Received createQuiz request: " + payload);
        Long topicId = Long.valueOf(payload.get("topicId").toString());
        String difficulty = (String) payload.get("difficulty");
        int countMCQ = payload.containsKey("count") ? Integer.parseInt(payload.get("count").toString()) : 2;
        int countSAQ = payload.containsKey("countSAQ") ? Integer.parseInt(payload.get("countSAQ").toString()) : 0;

        // If they still pass 'count' but not countMCQ, use 'count' as countMCQ for
        // backward compatibility
        if (payload.containsKey("countMCQ")) {
            countMCQ = Integer.parseInt(payload.get("countMCQ").toString());
        }

        return ResponseEntity.ok(quizService.createQuiz(topicId, difficulty, countMCQ, countSAQ));
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<Quiz>> getQuizzesByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(quizService.getQuizzesByTopic(topicId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<com.springpro.entity.QuizQuestion>> getQuizQuestions(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuestionsByQuizId(quizId));
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<com.springpro.entity.QuizQuestion> createQuestion(
            @PathVariable Long quizId,
            @RequestBody com.springpro.entity.QuizQuestion question) {
        return ResponseEntity.ok(quizService.createQuestion(quizId, question));
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<com.springpro.entity.QuizQuestion> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody com.springpro.entity.QuizQuestion question) {
        return ResponseEntity.ok(quizService.updateQuestion(questionId, question));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        quizService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(quizService.getAllStudents());
    }

    @GetMapping("/students/1")
    public ResponseEntity<List<Student>> getAllStudentsbyOne() {
        return ResponseEntity.ok(quizService.getAllStudents());
    }

    @PostMapping("/{quizId}/assign")
    public ResponseEntity<Void> assignQuiz(
            @PathVariable Long quizId,
            @RequestBody Map<String, Object> payload) {
        boolean allStudents = payload.containsKey("allStudents") && (boolean) payload.get("allStudents");
        if (allStudents) {
            quizService.assignQuizToAllStudents(quizId);
        } else if (payload.get("studentIds") instanceof List<?> idsList) {
            List<Long> studentIds = idsList.stream()
                    .map(id -> Long.valueOf(id.toString()))
                    .collect(java.util.stream.Collectors.toList());
            quizService.assignQuizToStudents(quizId, studentIds);
        }
        return ResponseEntity.ok().build();
    }
}
