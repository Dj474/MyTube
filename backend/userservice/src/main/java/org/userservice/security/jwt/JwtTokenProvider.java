package org.userservice.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.io.Decoders;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.access.secret}")
    private String jwtAccessSecret;

    @Value("${app.jwt.access.expiration}")
    private long jwtAccessExpiration;

    @Value("${app.jwt.refresh.secret}")
    private String jwtRefreshSecret;

    @Value("${app.jwt.refresh.expiration}")
    private long jwtRefreshExpiration;

    private Key getAccessTokenSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtAccessSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Key getRefreshTokenSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtRefreshSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessTokenFromId(Long id) {
        return Jwts.builder()
                .setSubject(id.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtAccessExpiration))
                .signWith(getAccessTokenSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshTokenFromId(Long id) {
        return Jwts.builder()
                .setSubject(id.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtRefreshExpiration))
                .signWith(getRefreshTokenSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Long getUserIdFromAccessToken(String token) {
        String stringId = Jwts.parserBuilder()
                .setSigningKey(getAccessTokenSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody().getSubject();;

        return Long.parseLong(stringId);
    }

    public Long getUserIdFromRefreshToken(String token) {
        String stringId = Jwts.parserBuilder()
                .setSigningKey(getRefreshTokenSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody().getSubject();

        return Long.parseLong(stringId);
    }

    public boolean validateAccessToken(String token) {
        return validateToken(token, getAccessTokenSigningKey());
    }

    public boolean validateRefreshToken(String token) {
        return validateToken(token, getRefreshTokenSigningKey());
    }

    private boolean validateToken(String token, Key key) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        }
        catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
