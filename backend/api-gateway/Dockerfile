# Этап 1: Сборка (Builder)
FROM maven:3.8.4-openjdk-17 AS builder
WORKDIR /app

# Кэшируем зависимости (ускоряет последующие сборки)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Копируем исходники и собираем проект
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true

# Этап 2: Запуск (Runtime)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Создаем не-root пользователя для безопасности
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Копируем только собранный jar из первого этапа
COPY --from=builder /app/target/*.jar app.jar

# Настройки портов
EXPOSE 8090

# Запуск приложения
ENTRYPOINT ["java", "-jar", "app.jar"]