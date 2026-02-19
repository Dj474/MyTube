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
import java.util.*;

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
    public Map<String, String> processVideoTask(String fileKey, UUID videoId) {
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
        File inputFile = tempDir.resolve("raw_" + fileKey).toFile();
        File thumbFile = new File(System.getProperty("java.io.tmpdir"), videoId + ".jpg");

        Map<String, String> map = new HashMap<>();

        storageService.download(inputFile, fileKey);

        List<Integer> resolutions = new ArrayList<>();
        resolutions.add(360);
        resolutions.add(720);
        resolutions.add(1080);

        for(int size : resolutions) {
            File outputFile = tempDir.resolve("proc_" + size + "_" + fileKey).toFile();
            try {
                File outputFolder = tempDir.resolve("hls_" + size + "_" + videoId).toFile();
                executeFFmpegHls(inputFile, outputFolder, size);
                storageService.uploadFolder(outputFolder.listFiles(), videoId, size);
                createPreviev(inputFile, thumbFile);
                map.put("thumbUrl", storageService.uploadThumbnail(videoId, thumbFile));
                if (outputFile.exists()) outputFile.delete();
            } catch (Exception e) {
                log.error(e.getMessage());
                if (outputFile.exists()) outputFile.delete();
                if (inputFile.exists()) inputFile.delete();
                return null;
            }
        }
        if (inputFile.exists()) inputFile.delete();
        map.put("videoUrl", createMasterPlaylist(videoId, resolutions));
        return map;
    }

    private String createMasterPlaylist(UUID videoId, List<Integer> resolutions) {
        StringBuilder m3u8 = new StringBuilder("#EXTM3U\n#EXT-X-VERSION:3\n\n");

        for (int res : resolutions) {
            // Рассчитываем примерный битрейт (в битах в секунду)
            int bandwidth = (res == 1080) ? 5000000 : (res == 720) ? 2800000 : 800000;
            String resolutionStr = (res == 1080) ? "1920x1080" : (res == 720) ? "1280x720" : "640x360";

            m3u8.append("#EXT-X-STREAM-INF:BANDWIDTH=").append(bandwidth)
                    .append(",RESOLUTION=").append(resolutionStr)
                    .append("\n")
                    .append(res).append("/index.m3u8\n"); // Относительный путь!
        }

        // Загружаем готовую строку как байты в корень папки видео
        return storageService.uploadBytes(m3u8.toString().getBytes(), videoId + "/master.m3u8");
    }

    private void createPreviev(File localVideoFile, File thumbFile) throws IOException, InterruptedException {

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y", "-ss", "00:00:01",
                "-i", localVideoFile.getAbsolutePath(),
                "-frames:v", "1",
                "-q:v", "2",
                thumbFile.getAbsolutePath()
        );

        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg failed for create thumbnail");
        }

    }
}
