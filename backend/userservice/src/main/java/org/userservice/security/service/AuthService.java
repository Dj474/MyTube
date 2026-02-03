package org.userservice.security.service;


import org.userservice.dto.security.AuthenticationDtoIn;
import org.userservice.dto.security.JwtDtoOut;
import org.userservice.dto.security.JwtRefreshDtoIn;
import org.userservice.dto.security.JwtRefreshDtoOut;
import org.userservice.entity.user.User;

public interface AuthService {

    JwtDtoOut register(AuthenticationDtoIn userDtoIn);

    JwtDtoOut login(AuthenticationDtoIn userDtoIn);

    JwtRefreshDtoOut refreshToken(JwtRefreshDtoIn refreshDtoIn);

    User getCurrentUser();
}
