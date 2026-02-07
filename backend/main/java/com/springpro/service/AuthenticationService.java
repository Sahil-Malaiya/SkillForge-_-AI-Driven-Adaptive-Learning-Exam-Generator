package com.springpro.service;

import com.springpro.dto.AuthenticationRequest;
import com.springpro.dto.AuthenticationResponse;
import com.springpro.dto.RegisterRequest;
import com.springpro.entity.User;
import com.springpro.entity.Student;
import com.springpro.entity.Role;
import com.springpro.repository.UserRepository;
import com.springpro.repository.StudentRepository;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationService(UserRepository repository,
                                 StudentRepository studentRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 AuthenticationManager authenticationManager,
                                 EmailService emailService) {
        this.repository = repository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    public AuthenticationResponse register(RegisterRequest request) {

        // Prevent admin registration through public endpoint
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed through this endpoint");
        }

        // store raw password for email
        String rawPassword = request.getPassword();

        var user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(rawPassword),
                request.getRole());

        repository.save(user);

        // If the user is a student, also create a record in the students table
        Long studentId = null;
        if (request.getRole() == Role.STUDENT) {
            Student student = new Student(request.getFullName(), request.getEmail());
            student = studentRepository.save(student);
            studentId = student.getId();
        }

        // EMAIL SEND AFTER REGISTRATION
        try {
            emailService.sendRegistrationEmail(
                    user.getEmail(),
                    user.getFullName(),
                    rawPassword
            );
            System.out.println("Registration email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
        }

        var jwtToken = jwtService.generateToken(user);

        return new AuthenticationResponse(
                jwtToken,
                user.getRole(),
                user.getId(),
                studentId,
                user.getEmail(),
                user.getFullName());
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());

        var jwtToken = jwtService.generateToken(claims, user);

        Long studentId = null;
        if (user.getRole() == Role.STUDENT) {
            studentId = studentRepository.findByEmail(user.getEmail())
                    .map(Student::getId)
                    .orElse(null);
        }

        return new AuthenticationResponse(
                jwtToken,
                user.getRole(),
                user.getId(),
                studentId,
                user.getEmail(),
                user.getFullName());
    }
}
