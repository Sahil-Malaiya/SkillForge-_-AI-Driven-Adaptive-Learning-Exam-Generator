package com.springpro.service;

import com.springpro.dto.AuthenticationRequest;
import com.springpro.dto.AuthenticationResponse;
import com.springpro.dto.RegisterRequest;
import com.springpro.entity.User;
import com.springpro.entity.Student;
import com.springpro.entity.Role;
import com.springpro.repository.UserRepository;
import com.springpro.repository.StudentRepository;
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

    public AuthenticationService(UserRepository repository, StudentRepository studentRepository,
            PasswordEncoder passwordEncoder, JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthenticationResponse register(RegisterRequest request) {
        // Prevent admin registration through public endpoint
        if (request.getRole() == com.springpro.entity.Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed through this endpoint");
        }

        var user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole());
        repository.save(user);

        // If the user is a student, also create a record in the students table
        if (request.getRole() == Role.STUDENT) {
            Student student = new Student(request.getFullName(), request.getEmail());
            studentRepository.save(student);
        }
        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken, user.getRole(), user.getId(), user.getEmail(), user.getFullName());
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return new AuthenticationResponse(jwtToken, user.getRole(), user.getId(), user.getEmail(), user.getFullName());
    }
}