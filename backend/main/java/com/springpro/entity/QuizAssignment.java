package com.springpro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_assignments", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "quiz_id", "student_id" })
})
public class QuizAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "course_id", nullable = true)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status = AssignmentStatus.NOT_STARTED;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    public QuizAssignment() {
        this.assignedAt = LocalDateTime.now();
    }

    public QuizAssignment(Quiz quiz, Student student, Course course) {
        this.quiz = quiz;
        this.student = student;
        this.course = course;
        this.status = AssignmentStatus.NOT_STARTED;
        this.assignedAt = LocalDateTime.now();
    }

    public QuizAssignment(Quiz quiz, Student student) {
        this.quiz = quiz;
        this.student = student;
        this.assignedAt = LocalDateTime.now();
    }

    // ---------- Getters & Setters ----------

    public Long getId() {
        return id;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public AssignmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
}
