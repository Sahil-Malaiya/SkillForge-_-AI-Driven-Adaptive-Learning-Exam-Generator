package com.springpro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class StudentQuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Student student;

    @ManyToOne
    private Quiz quiz;

    private int score;

    private int totalQuestions;

    private boolean fullyAssessed = true;

    private int manualScore = 0;

    private LocalDateTime attemptedAt;

    // getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(LocalDateTime attemptedAt) {
        this.attemptedAt = attemptedAt;
    }

    public boolean isFullyAssessed() {
        return fullyAssessed;
    }

    public void setFullyAssessed(boolean fullyAssessed) {
        this.fullyAssessed = fullyAssessed;
    }

    public int getManualScore() {
        return manualScore;
    }

    public void setManualScore(int manualScore) {
        this.manualScore = manualScore;
    }
}
