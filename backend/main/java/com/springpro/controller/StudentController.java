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

    // For now return all courses as "enrolled" for the student (placeholder until enrollment implemented)
    @GetMapping("/{id}/courses")
    public List<com.springpro.entity.Course> getEnrolledCourses(@PathVariable Long id) {
        return courseRepository.findAll();
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
