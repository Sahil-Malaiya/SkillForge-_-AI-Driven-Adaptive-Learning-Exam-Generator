package com.springpro.entity;

import jakarta.persistence.*;

@Entity
public class StudentQuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private StudentQuizAttempt attempt;

    @ManyToOne
    private QuizQuestion question;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    private Integer marksObtained;

    private boolean graded = false;

    // getters + setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StudentQuizAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(StudentQuizAttempt attempt) {
        this.attempt = attempt;
    }

    public QuizQuestion getQuestion() {
        return question;
    }

    public void setQuestion(QuizQuestion question) {
        this.question = question;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public Integer getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Integer marksObtained) {
        this.marksObtained = marksObtained;
    }

    public boolean isGraded() {
        return graded;
    }

    public void setGraded(boolean graded) {
        this.graded = graded;
    }
}
