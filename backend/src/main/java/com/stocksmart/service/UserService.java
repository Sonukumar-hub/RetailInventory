package com.stocksmart.service;

import com.stocksmart.dto.user.*;
import com.stocksmart.entity.*;
import com.stocksmart.exception.*;
import com.stocksmart.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> getAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public UserResponse create(UserRequest req) {
        if (userRepository.existsByUsername(req.username()))
            throw new BadRequestException("Username already taken: " + req.username());
        if (userRepository.existsByEmail(req.email()))
            throw new BadRequestException("Email already in use: " + req.email());

        Set<Role> roles = resolveRoles(req.roles());
        User user = User.builder()
                .username(req.username()).email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .firstName(req.firstName()).lastName(req.lastName())
                .active(true).roles(roles).build();
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserRequest req) {
        User user = findById(id);
        if (!user.getUsername().equals(req.username()) && userRepository.existsByUsername(req.username()))
            throw new BadRequestException("Username already taken");
        if (!user.getEmail().equals(req.email()) && userRepository.existsByEmail(req.email()))
            throw new BadRequestException("Email already in use");

        user.setUsername(req.username()); user.setEmail(req.email());
        user.setFirstName(req.firstName()); user.setLastName(req.lastName());
        if (req.password() != null && !req.password().isBlank())
            user.setPassword(passwordEncoder.encode(req.password()));
        user.setRoles(resolveRoles(req.roles()));
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void toggleActive(Long id) {
        User user = findById(id);
        user.setActive(!user.getActive());
        userRepository.save(user);
    }

    private Set<Role> resolveRoles(List<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String name : roleNames) {
            String roleName = name.startsWith("ROLE_") ? name : "ROLE_" + name;
            roles.add(roleRepository.findByName(roleName)
                    .orElseThrow(() -> new BadRequestException("Role not found: " + name)));
        }
        return roles;
    }

    private User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private UserResponse toResponse(User u) {
        List<String> roles = u.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        return new UserResponse(u.getId(), u.getUsername(), u.getEmail(),
                u.getFirstName(), u.getLastName(), u.getActive(), roles, u.getCreatedAt());
    }
}
