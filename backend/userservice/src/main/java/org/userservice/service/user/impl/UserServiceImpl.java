package org.userservice.service.user.impl;

import org.springframework.stereotype.Service;
import org.userservice.entity.user.User;
import org.userservice.security.service.AuthService;
import org.userservice.service.user.UserService;

@Service
public class UserServiceImpl implements UserService {
    private final AuthService authService;

    public UserServiceImpl(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public User getCurrent() {
        return authService.getCurrentUser();
    }
}
