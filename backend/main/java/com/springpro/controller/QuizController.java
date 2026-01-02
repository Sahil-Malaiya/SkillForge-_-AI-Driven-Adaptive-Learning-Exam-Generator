package com.springpro.controller;

import com.springpro.entity.Quiz;
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
        Long topicId = Long.valueOf(payload.get("topicId").toString());
        String difficulty = (String) payload.get("difficulty");
        return ResponseEntity.ok(quizService.createQuiz(topicId, difficulty));
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<Quiz>> getQuizzesByTopic(@PathVariable Long topicId) {
        return ResponseEntity.ok(quizService.getQuizzesByTopic(topicId));
    }
}
