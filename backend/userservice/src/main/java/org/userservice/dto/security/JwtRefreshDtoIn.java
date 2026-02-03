package org.userservice.dto.security;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtRefreshDtoIn {

    @NotNull(message = "Refresh token must not be null")
    private String refreshToken;

}
