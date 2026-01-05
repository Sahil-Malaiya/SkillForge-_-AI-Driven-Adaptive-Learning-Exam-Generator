package com.springpro.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.json.JSONArray;
import org.json.JSONObject;

@Service
public class OllamaService {

    private final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private final String MODEL = "mistral"; // or deepseek

    public JSONArray generateMCQ(String topicName, String difficulty) {

        RestTemplate restTemplate = new RestTemplate();

        JSONObject req = new JSONObject();
        req.put("model", MODEL);
        req.put("prompt",
            "Generate 10 MCQ questions on topic: " + topicName +
            " with difficulty: " + difficulty +
            ". Return JSON ONLY in format:\n" +
            "[{\"question\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":\"A\"}]");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(req.toString(), headers);

        try {
            ResponseEntity<String> res = restTemplate.exchange(OLLAMA_URL, HttpMethod.POST, entity, String.class);

            // Ollama streams — get last JSON block
            String body = res.getBody();

            StringBuilder content = new StringBuilder();
            for (String line : body.split("\n")) {
                if (line == null || line.isBlank()) continue;
                JSONObject obj = new JSONObject(line);
                if (obj.has("response")) {
                    content.append(obj.getString("response"));
                } else if (obj.has("error")) {
                    throw new RuntimeException("Ollama returned error: " + obj.toString());
                }
            }

            return new JSONArray(content.toString());
        } catch (HttpStatusCodeException ex) {
            String respBody = ex.getResponseBodyAsString();
            throw new RuntimeException("Failed to call Ollama: status=" + ex.getStatusCode() + ", body=" + respBody);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to parse Ollama response: " + ex.getMessage(), ex);
        }
    }

    public boolean isAvailable() {
        try {
            RestTemplate rt = new RestTemplate();
            ResponseEntity<String> r = rt.getForEntity("http://localhost:11434/", String.class);
            return r.getStatusCode().is2xxSuccessful();
        } catch (Exception ex) {
            return false;
        }
    }
}
