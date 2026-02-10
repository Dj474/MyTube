package org.videoprocessservice.service.ffmpeg.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.videoprocessservice.service.ffmpeg.ProcessService;
import org.videoprocessservice.service.minio.StorageService;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessServiceSizeImpl implements ProcessService {

    private final StorageService storageService;

    @Override
    public boolean processVideoTask(String fileKey, UUID videoId) {
        // Создаем уникальные имена для временных файлов
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
        File inputFile = tempDir.resolve("raw_" + fileKey).toFile();

        storageService.download(inputFile, fileKey);

        for(int size = 360; size <= 1080; size += 360) {
            File outputFile = tempDir.resolve("proc_" + size + "_" + fileKey).toFile();
            try {
                executeFFmpeg(inputFile, outputFile, size);
                storageService.upload(outputFile, videoId + "/" + size + ".mp4");
                if (outputFile.exists()) outputFile.delete();
            } catch (Exception e) {
                log.error(e.getMessage());
                if (outputFile.exists()) outputFile.delete();
                if (inputFile.exists()) inputFile.delete();
                return false;
            }
        }
        if (inputFile.exists()) inputFile.delete();
        return true;
    }

    private void executeFFmpeg(File input, File output, int height) throws IOException, InterruptedException {
        log.info("Starting FFmpeg: scaling to {}p...", height);

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", input.getAbsolutePath(),
                "-vf", "scale=-2:" + height, // Масштабирование: ширина авто, высота задана
                "-vcodec", "libx264",        // Стандартный кодек для веба
                "-crf", "23",                 // Качество (чем меньше, тем лучше, 23 — баланс)
                "-preset", "veryfast",       // Скорость кодирования
                "-acodec", "aac",            // Аудиокодек (обязателен для HLS в будущем)
                "-y",                        // Перезаписать, если файл существует
                output.getAbsolutePath()
        );

        pb.redirectErrorStream(true);
        Process process = pb.start();

        // Логируем процесс, чтобы видеть прогресс в консоли
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                log.debug("FFmpeg [{}p]: {}", height, line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg failed for " + height + "p with exit code: " + exitCode);
        }

//                java.nio.file.Files.copy(
//                input.toPath(),
//                output.toPath(),
//                java.nio.file.StandardCopyOption.REPLACE_EXISTING
//        );
    }
}
