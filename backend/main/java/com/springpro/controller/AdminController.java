package com.springpro.controller;

import com.springpro.dto.AuthenticationResponse;
import com.springpro.dto.RegisterRequest;
import com.springpro.entity.Role;
import com.springpro.entity.User;
import com.springpro.repository.UserRepository;
import com.springpro.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/create-admin")
    public ResponseEntity<AuthenticationResponse> createAdmin(@RequestBody RegisterRequest request) {
        // Create admin user
        var user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.ADMIN);
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthenticationResponse(jwtToken, user.getRole(), user.getId(), null,
                user.getEmail(), user.getFullName()));
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("fullName", user.getFullName());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("role", user.getRole());
                    return userInfo;
                })
                .collect(Collectors.toList());
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            response.put("message", "User deleted successfully");
            response.put("status", "success");
        } else {
            response.put("message", "User not found");
            response.put("status", "error");
        }
        return response;
    }
}
