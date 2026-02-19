# Этап 1: Сборка (если ты хочешь собирать jar внутри докера)
# Если ты собираешь jar локально через Maven, можно начать сразу с Stage 2
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Этап 2: Runtime (финальный образ)
FROM eclipse-temurin:21-jre-alpine

# 1. Устанавливаем FFmpeg
# --no-cache позволяет не хранить индекс пакетов, уменьшая размер образа
RUN apk add --no-cache ffmpeg

# 2. Создаем рабочую директорию
WORKDIR /app

# 3. Копируем скомпилированный JAR из первого этапа
COPY --from=build /app/target/*.jar app.jar

# 4. Указываем папку для временных файлов (важно для обработки видео)
VOLUME /tmp

# 5. Запуск приложения
ENTRYPOINT ["java", "-jar", "app.jar"]