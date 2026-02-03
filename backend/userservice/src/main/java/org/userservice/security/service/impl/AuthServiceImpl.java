package org.userservice.security.service.impl;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.userservice.dto.security.AuthenticationDtoIn;
import org.userservice.dto.security.JwtDtoOut;
import org.userservice.dto.security.JwtRefreshDtoIn;
import org.userservice.dto.security.JwtRefreshDtoOut;
import org.userservice.entity.user.User;
import org.userservice.exception.ForbiddenException;
import org.userservice.exception.NotFoundException;
import org.userservice.repository.user.UserRepository;
import org.userservice.security.jwt.JwtTokenProvider;
import org.userservice.security.service.AuthService;

import java.util.Objects;

@Service
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    private JwtDtoOut getJwtForUser(User user) {
        JwtDtoOut jwtDtoOut = new JwtDtoOut();
        jwtDtoOut.setAccessToken(jwtTokenProvider.generateAccessTokenFromId(user.getId()));
        jwtDtoOut.setRefreshToken(jwtTokenProvider.generateRefreshTokenFromId(user.getId()));
        jwtDtoOut.setId(user.getId());
        return jwtDtoOut;
    }

    @Override
    @Transactional
    public JwtDtoOut register(AuthenticationDtoIn userDtoIn) {
        if (userRepository.existsByEmail(userDtoIn.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Login exists");
        }

        User user = new User();
        user.setEmail(userDtoIn.getEmail());
        user.setPassword(passwordEncoder.encode(userDtoIn.getPassword()));
        userRepository.save(user);

        return getJwtForUser(user);
    }

    @Override
    @Transactional
    public JwtDtoOut login(AuthenticationDtoIn userDtoIn) {

        User user = userRepository.findByEmail(userDtoIn.getEmail()).orElse(null);
        if (Objects.isNull(user)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Login not exists");
        }

        if (!passwordEncoder.matches(userDtoIn.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong password");
        }

        return getJwtForUser(user);
    }

    @Override
    public JwtRefreshDtoOut refreshToken(JwtRefreshDtoIn refreshDtoIn) {

        if (!jwtTokenProvider.validateRefreshToken(refreshDtoIn.getRefreshToken())) {
            throw new ForbiddenException("Refresh token expired");
        }

        Long id = jwtTokenProvider.getUserIdFromRefreshToken(refreshDtoIn.getRefreshToken());

        User user = userRepository.findById(id).orElse(null);
        if (Objects.isNull(user)) {
            throw new NotFoundException("User not exists");
        }

        JwtRefreshDtoOut jwtRefreshDtoOut = new JwtRefreshDtoOut();
        jwtRefreshDtoOut.setRefreshToken(refreshDtoIn.getRefreshToken());
        jwtRefreshDtoOut.setAccessToken(jwtTokenProvider.generateAccessTokenFromId(user.getId()));
        return jwtRefreshDtoOut;
    }

    @Override
    @Transactional
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return userRepository.getReferenceById((Long) principal);
        }
        throw new ForbiddenException("Invalid credentials");
    }
}
