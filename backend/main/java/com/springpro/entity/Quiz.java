package com.springpro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quizzes")
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    private String difficulty; // Easy, Medium, Hard

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<QuizQuestion> questions;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Quiz() {
    }

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<QuizAssignment> assignments;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<com.springpro.entity.StudentQuizAttempt> attempts;

    public Quiz(Long id, Topic topic, String difficulty, LocalDateTime createdAt) {
        this.id = id;
        this.topic = topic;
        this.difficulty = difficulty;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.util.List<QuizQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(java.util.List<QuizQuestion> questions) {
        this.questions = questions;
    }

    public java.util.List<QuizAssignment> getAssignments() {
        return assignments;
    }

    public void setAssignments(java.util.List<QuizAssignment> assignments) {
        this.assignments = assignments;
    }

    public java.util.List<com.springpro.entity.StudentQuizAttempt> getAttempts() {
        return attempts;
    }

    public void setAttempts(java.util.List<com.springpro.entity.StudentQuizAttempt> attempts) {
        this.attempts = attempts;
    }
}
