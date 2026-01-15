package com.springpro.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Quiz quiz;

    @Column(columnDefinition = "TEXT")
    private String question;
    @Column(columnDefinition = "TEXT")
    private String optionA;
    @Column(columnDefinition = "TEXT")
    private String optionB;
    @Column(columnDefinition = "TEXT")
    private String optionC;
    @Column(columnDefinition = "TEXT")
    private String optionD;
       
    @Enumerated(EnumType.STRING)
    private QuestionType type = QuestionType.MCQ;

    private String correctAnswer;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<StudentQuizAnswer> answers;

    // getters + setters
    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public java.util.List<StudentQuizAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(java.util.List<StudentQuizAnswer> answers) {
        this.answers = answers;
    }

}
