package org.videoprocessservice.service.minio;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final AmazonS3 s3Client;

    @Value("${app.s3.download_bucket}")
    private String downloadBucket;

    @Value("${app.s3.upload_bucket}")
    private String uploadBucket;

    private String upload(File file, String key) {
        s3Client.putObject(new PutObjectRequest(uploadBucket, key, file));
        return key;
    }

    private void download(File file, String key) {

        S3Object object = s3Client.getObject(new GetObjectRequest(downloadBucket, key));
        try(InputStream inputStream = object.getObjectContent()) {
            FileOutputStream fileInputStream = new FileOutputStream(file);
            inputStream.transferTo(fileInputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void executeFFmpeg(File input, File output) throws IOException, InterruptedException {
        log.info("Starting FFmpeg processing...");

        // Пример команды: меняем разрешение на 1280x720 и используем кодек x264
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", input.getAbsolutePath(),
                "-vf", "scale=-2:720",
                "-vcodec", "libx264",
                "-crf", "23",
                "-preset", "veryfast",
                "-y", // Перезаписывать файл, если он есть
                output.getAbsolutePath()
        );

        pb.redirectErrorStream(true); // Объединяем поток ошибок и вывода
        Process process = pb.start();

        // Читаем логи ffmpeg (важно, чтобы процесс не завис из-за переполнения буфера)
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                log.debug("FFmpeg: {}", line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg exited with error code: " + exitCode);
        }

//        java.nio.file.Files.copy(
//                input.toPath(),
//                output.toPath(),
//                java.nio.file.StandardCopyOption.REPLACE_EXISTING
//        );

    }

    public void processVideoTask(String fileKey) {
        // Создаем уникальные имена для временных файлов
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"));
        File inputFile = tempDir.resolve("raw_" + fileKey).toFile();
        File outputFile = tempDir.resolve("proc_" + fileKey).toFile();

        try {
            // 1. СКАЧИВАНИЕ (Download)
            download(inputFile, fileKey);

            // 2. ОБРАБОТКА (Processing)
            // Допустим, мы сжимаем видео и переводим в 720p
            executeFFmpeg(inputFile, outputFile);

            // 3. ВЫГРУЗКА (Upload)
            upload(outputFile, fileKey);

            log.info("Video {} processed successfully", fileKey);
        } catch (Exception e) {
            log.error("Failed to process video {}", fileKey, e);
        } finally {
            // Обязательно чистим за собой временные файлы
            if (inputFile.exists()) inputFile.delete();
            if (outputFile.exists()) outputFile.delete();
        }
    }


}
