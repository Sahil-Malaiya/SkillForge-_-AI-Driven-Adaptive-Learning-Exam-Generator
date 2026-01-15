package com.springpro.dto;

import com.springpro.entity.Role;

public class AuthenticationResponse {
    private String token;
    private Role role;
    private Long userId;
    private Long studentId;
    private String email;
    private String fullName;

    public AuthenticationResponse() {
    }

    public AuthenticationResponse(String token, Role role, Long userId, Long studentId, String email, String fullName) {
        this.token = token;
        this.role = role;
        this.userId = userId;
        this.studentId = studentId;
        this.email = email;
        this.fullName = fullName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
