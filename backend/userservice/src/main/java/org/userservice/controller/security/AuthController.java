package org.userservice.controller.security;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.userservice.dto.security.AuthenticationDtoIn;
import org.userservice.dto.security.JwtDtoOut;
import org.userservice.dto.security.JwtRefreshDtoIn;
import org.userservice.dto.security.JwtRefreshDtoOut;

@RequestMapping("api/v1/auth")
public interface AuthController {

    @PostMapping("/register")
    JwtDtoOut register(@Valid @RequestBody AuthenticationDtoIn userDtoIn);

    @PostMapping("/signin")
    JwtDtoOut login(@Valid @RequestBody AuthenticationDtoIn userDtoIn);

    @PostMapping("/refresh")
    JwtRefreshDtoOut refreshToken(@Valid @RequestBody JwtRefreshDtoIn refreshDtoIn);

}
