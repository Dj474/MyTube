package org.userservice.dto.security;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JwtRefreshDtoOut {

    private String accessToken;

    private String refreshToken;

}
