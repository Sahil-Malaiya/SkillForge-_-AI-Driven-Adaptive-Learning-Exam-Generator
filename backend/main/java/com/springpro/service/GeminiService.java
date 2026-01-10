package com.springpro.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiService {

    @Value("${gemini.api.url:}")
    private String geminiUrl;

    @Value("${gemini.api.key:}")
    private String geminiKey;

    public JSONArray generateMCQ(String topicName, String difficulty, int count) {

        // Configure timeouts (important for AI calls)
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(60000);
        RestTemplate restTemplate = new RestTemplate(factory);

        // Prompt
        String prompt = "Generate EXACTLY " + count + " distinct MCQ questions on topic: " + topicName +
                " with difficulty: " + difficulty +
                ". Return JSON ONLY in format of a JSON array with " + count + " objects. Format example:\n" +
                "[{\"question\":\"...\",\"options\":[\"Option 1\",\"Option 2\",\"Option 3\",\"Option 4\"],\"answer\":\"A\"}]";

        // Build Gemini request body
        JSONObject requestBody = new JSONObject();
        JSONArray contents = new JSONArray();
        JSONObject contentObj = new JSONObject();
        JSONArray parts = new JSONArray();
        JSONObject part = new JSONObject();

        part.put("text", prompt);
        parts.put(part);
        contentObj.put("parts", parts);
        contents.put(contentObj);
        requestBody.put("contents", contents);

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // API URL with key
        String urlWithKey = geminiUrl + "?key=" + geminiKey;
        String requestJson = requestBody.toString();
        System.out.println("Gemini Request URL: " + urlWithKey.substring(0, Math.min(urlWithKey.length(), 60)) + "...");
        System.out.println("Gemini Request Body: " + requestJson);
        HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(urlWithKey, HttpMethod.POST, entity, String.class);

            String responseBody = response.getBody();
            System.out.println("Gemini Raw Response Body: " + responseBody);

            JSONObject jsonResponse = new JSONObject(responseBody);

            // Handle Gemini error response
            if (jsonResponse.has("error")) {
                throw new RuntimeException("Gemini API Error: " +
                        jsonResponse.getJSONObject("error").toString());
            }

            // Extract AI text response
            String textResponse = jsonResponse
                    .getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");

            System.out.println("Gemini Extracted Text: " + textResponse);
            String fullResponse = textResponse.trim();
            System.out.println("Gemini Raw Response: " + fullResponse);

            // Remove markdown if present
            if (fullResponse.startsWith("```json")) {
                fullResponse = fullResponse.replace("```json", "").replace("```", "");
            } else if (fullResponse.startsWith("```")) {
                fullResponse = fullResponse.replace("```", "");
            }

            // Extract JSON array only
            int start = fullResponse.indexOf("[");
            int end = fullResponse.lastIndexOf("]");
            if (start == -1 || end == -1) {
                throw new RuntimeException("Invalid JSON returned by Gemini");
            }

            fullResponse = fullResponse.substring(start, end + 1);

            return new JSONArray(fullResponse);

        } catch (HttpStatusCodeException ex) {
            System.err.println("Gemini HTTP Error: " + ex.getResponseBodyAsString());
            throw new RuntimeException(
                    "Gemini API call failed with status " + ex.getStatusCode(), ex);
        } catch (Exception ex) {
            System.err.println("Gemini Error: " + ex.getMessage());
            ex.printStackTrace();
            throw new RuntimeException("Failed to generate MCQs using Gemini", ex);
        }
    }

    public boolean isAvailable() {
        return geminiKey != null && !geminiKey.isBlank();
    }
}
