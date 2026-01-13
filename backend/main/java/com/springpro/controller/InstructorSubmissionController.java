package com.springpro.controller;

import com.springpro.entity.StudentQuizAnswer;
import com.springpro.entity.StudentQuizAttempt;
import com.springpro.service.InstructorSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructor/submissions")
@CrossOrigin(origins = "*")
public class InstructorSubmissionController {

    @Autowired
    private InstructorSubmissionService submissionService;

    @GetMapping("/ungraded")
    public ResponseEntity<List<StudentQuizAttempt>> getUngradedAttempts() {
        return ResponseEntity.ok(submissionService.getUngradedAttempts());
    }

    @GetMapping("/{attemptId}/answers")
    public ResponseEntity<List<StudentQuizAnswer>> getAnswersToGrade(@PathVariable Long attemptId) {
        return ResponseEntity.ok(submissionService.getAnswersToGrade(attemptId));
    }

    @PostMapping("/{attemptId}/grade")
    public ResponseEntity<StudentQuizAttempt> gradeAttempt(
            @PathVariable Long attemptId,
            @RequestBody Map<String, Integer> marks) {
        // Map<String, Integer> because JSON keys are strings, but we need Long IDs
        java.util.Map<Long, Integer> longMarks = new java.util.HashMap<>();
        marks.forEach((k, v) -> longMarks.put(Long.valueOf(k), v));

        return ResponseEntity.ok(submissionService.gradeAttempt(attemptId, longMarks));
    }
}
