# Этап 1: Сборка приложения
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Копируем pom.xml для кэширования зависимостей
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Копируем исходный код
COPY src ./src

# Собираем приложение
RUN mvn clean package -Dmaven.test.skip=true

# Этап 2: Финальный образ
FROM eclipse-temurin:21-jre

# Создаем непривилегированного пользователя для безопасности
RUN addgroup --system --gid 1001 spring && \
    adduser --system --uid 1001 --ingroup spring spring
USER spring:spring

WORKDIR /app

# Копируем собранный JAR из этапа сборки
COPY --from=builder /app/target/*.jar app.jar

# Открываем порт (Spring Boot по умолчанию 8080)
EXPOSE 8080

# Переменные окружения по умолчанию
ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Команда запуска
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]