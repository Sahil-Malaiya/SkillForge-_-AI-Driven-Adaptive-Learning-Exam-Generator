package com.springpro.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.util.Map;

@Data
@Getter
@Setter
public class QuizSubmitRequest {

    private Long quizId;

    // key = questionId , value = selected option text
    private Map<Long, String> answers;

    // Explicit getter and setter for answers
    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
}
