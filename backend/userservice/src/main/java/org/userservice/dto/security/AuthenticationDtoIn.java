package org.userservice.dto.security;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthenticationDtoIn {

    @NotNull(message = "Login must not be null")
    @NotEmpty(message = "Login must not be empty")
    private String email;

    @NotNull(message = "Password must not be null")
    @NotEmpty(message = "Password must not be empty")
    private String password;
}
