package org.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.Key;
import java.time.LocalDateTime;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Value("${app.jwt.access.secret}")
    private String jwtAccessSecret;

    @Value("${app.jwt.access.expiration}")
    private long jwtAccessExpiration;

    // ВАЖНО: Этот секрет должен быть ТОЧНО ТАКОЙ ЖЕ, как в UserService,
    // которым подписываются токены. Лучше вынести в properties.
    //public static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 1. Проверяем наличие заголовка
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {

                return onError(exchange, "Нет заголовка Authorization", HttpStatus.UNAUTHORIZED);
            }



            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }

            try {
                // 2. Валидируем токен (библиотека выкинет исключение, если токен подделан или истек)
                validateToken(authHeader);

                // (Опционально) Можно достать username/ID и передать дальше в VideoService
                 String userId = String.valueOf(getUserIdFromAccessToken(authHeader));
                 ServerHttpRequest request = exchange.getRequest().mutate()
                        .header("X-User-Id", userId).build();
                 return chain.filter(exchange.mutate().request(request).build());

            } catch (Exception e) {
                System.out.println("Ошибка валидации токена: " + e.getMessage());
                return onError(exchange, "Невалидный токен", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private void validateToken(String token) {
        Jwts.parserBuilder()
                .setSigningKey(getAccessTokenSigningKey())
                .build()
                .parseClaimsJws(token);
    }

    // Вспомогательный метод для возврата ошибки в реактивном стиле
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpRequest request = exchange.getRequest();

        // Вывод подробностей в консоль
        System.err.printf("[%s] АУТЕНТИФИКАЦИЯ ПРОВАЛЕНА:%n", LocalDateTime.now());
        System.err.printf("  Путь: %s %s%n", request.getMethod(), request.getURI().getPath());
        System.err.printf("  Причина: %s%n", err);
        System.err.printf("  IP: %s%n", request.getRemoteAddress());
        System.err.println("--------------------------------------------------");

        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
    }

    public Long getUserIdFromAccessToken(String token) {
        String stringId = Jwts.parserBuilder()
                .setSigningKey(getAccessTokenSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody().getSubject();;

        return Long.parseLong(stringId);
    }

    private Key getAccessTokenSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtAccessSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
