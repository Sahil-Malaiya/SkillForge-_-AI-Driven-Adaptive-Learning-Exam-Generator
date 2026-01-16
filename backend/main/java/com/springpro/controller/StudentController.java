package com.springpro.controller;

import com.springpro.entity.Student;
import com.springpro.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService service;

    @Autowired
    private com.springpro.repository.QuizAssignmentRepository quizAssignmentRepository;

    @Autowired
    private com.springpro.repository.StudentQuizAttemptRepository attemptRepository;

    @Autowired
    private com.springpro.repository.SubjectRepository subjectRepository;

    @Autowired
    private com.springpro.repository.CourseRepository courseRepository;

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return service.saveStudent(student);
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return service.getAllStudents();
    }

    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return service.getAllStudents().stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }

    @GetMapping("/{id}/courses")
    public List<com.springpro.entity.Course> getEnrolledCourses(@PathVariable Long id) {
        // Get all quiz attempts for this student
        List<com.springpro.entity.StudentQuizAttempt> attempts = attemptRepository.findByStudentId(id);

        // Extract unique course IDs from quiz attempts
        java.util.Set<Long> courseIds = new java.util.HashSet<>();
        for (com.springpro.entity.StudentQuizAttempt attempt : attempts) {
            if (attempt.getQuiz() != null && attempt.getQuiz().getTopic() != null) {
                Long subjectId = attempt.getQuiz().getTopic().getSubjectId();
                if (subjectId != null) {
                    subjectRepository.findById(subjectId).ifPresent(subject -> {
                        if (subject.getCourseId() != null) {
                            courseIds.add(subject.getCourseId());
                        }
                    });
                }
            }
        }

        // Fetch and return the courses
        return courseIds.stream()
                .map(courseId -> courseRepository.findById(courseId).orElse(null))
                .filter(course -> course != null)
                .collect(java.util.stream.Collectors.toList());
    }

    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student student) {
        return service.updateStudent(id, student);
    }

    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable Long id) {
        service.deleteStudent(id);
    }
}
