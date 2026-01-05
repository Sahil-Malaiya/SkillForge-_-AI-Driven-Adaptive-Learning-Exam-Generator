package com.springpro.dto;

import lombok.Data;
import java.util.Map;

@Data
public class QuizSubmitRequest {

    private Long quizId;

    // key = questionId , value = selected option text
    private Map<Long, String> answers;
}
