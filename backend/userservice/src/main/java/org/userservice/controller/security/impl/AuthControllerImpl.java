package org.userservice.controller.security.impl;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RestController;
import org.userservice.controller.security.AuthController;
import org.userservice.dto.security.AuthenticationDtoIn;
import org.userservice.dto.security.JwtDtoOut;
import org.userservice.dto.security.JwtRefreshDtoIn;
import org.userservice.dto.security.JwtRefreshDtoOut;
import org.userservice.security.service.AuthService;

@RestController
@AllArgsConstructor
public class AuthControllerImpl implements AuthController {

    private final AuthService authService;

    @Override
    public JwtDtoOut register(AuthenticationDtoIn userDtoIn) {
        return authService.register(userDtoIn);
    }

    @Override
    public JwtDtoOut login(AuthenticationDtoIn userDtoIn) {
        return authService.login(userDtoIn);
    }

    @Override
    public JwtRefreshDtoOut refreshToken(JwtRefreshDtoIn refreshDtoIn) {
        return authService.refreshToken(refreshDtoIn);
    }

}
