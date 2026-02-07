package com.springpro.controller;

import com.springpro.dto.AuthenticationRequest;
import com.springpro.dto.AuthenticationResponse;
import com.springpro.dto.RegisterRequest;
import com.springpro.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationService service;

    public AuthController(AuthenticationService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request) {

        // Service will handle user creation + email sending
        AuthenticationResponse response = service.register(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {

        AuthenticationResponse response = service.authenticate(request);

        return ResponseEntity.ok(response);
    }
}
