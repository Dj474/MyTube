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
public class ProcessServiceHlsImpl implements ProcessService {

    private final StorageService storageService;

    private void executeFFmpegHls(File input, File outputFolder, int height) throws IOException, InterruptedException {
        log.info("Starting FFmpeg: scaling to {}p...", height);

        if (!outputFolder.exists()) outputFolder.mkdirs();

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", input.getAbsolutePath(),
                "-vf", "scale=-2:" + height,
                "-vcodec", "libx264", "-crf", "23", "-preset", "veryfast",
                "-acodec", "aac", "-ar", "48000",
                // ПАРАМЕТРЫ HLS:
                "-f", "hls",                   // Формат HLS
                "-hls_time", "10",              // Длина сегмента 10 секунд
                "-hls_playlist_type", "vod",    // Тип плейлиста: Video On Demand
                "-hls_segment_filename", outputFolder.getAbsolutePath() + "/segment_%03d.ts", // Имя сегментов
                outputFolder.getAbsolutePath() + "/index.m3u8" // Имя плейлиста
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
    }

    @Override
    public boolean processVideoTask(String fileKey, UUID videoId) {
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
        File inputFile = tempDir.resolve("raw_" + fileKey).toFile();

        storageService.download(inputFile, fileKey);

        for(int size = 360; size <= 1080; size += 360) {
            File outputFile = tempDir.resolve("proc_" + size + "_" + fileKey).toFile();
            try {
                File outputFolder = tempDir.resolve("hls_" + size + "_" + videoId).toFile();
                executeFFmpegHls(inputFile, outputFolder, size);
                storageService.uploadFolder(outputFolder.listFiles(), videoId, size);
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
}
