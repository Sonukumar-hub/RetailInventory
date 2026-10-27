package com.stocksmart.service;

import com.stocksmart.dto.auth.*;
import com.stocksmart.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        String jwt = tokenProvider.generateToken(authentication);
        var userDetails = (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
        var roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return LoginResponse.of(jwt, userDetails.getUsername(), "", roles);
    }
}
