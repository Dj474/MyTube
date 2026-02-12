package org.videoprocessservice.service.minio;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final AmazonS3 s3Client;

    @Value("${app.s3.download_bucket}")
    private String downloadBucket;

    @Value("${app.s3.upload_bucket}")
    private String uploadBucket;

    @Value("${app.s3.endpoint}")
    private String s3Endpoint;

    @Value("${app.s3.thumbnail_bucket}")
    private String thumbnailBucket;

    public void upload(File file, String key) {
        s3Client.putObject(new PutObjectRequest(uploadBucket, key, file));
    }

    public void download(File file, String key) {

        S3Object object = s3Client.getObject(new GetObjectRequest(downloadBucket, key));
        try(InputStream inputStream = object.getObjectContent()) {
            FileOutputStream fileInputStream = new FileOutputStream(file);
            inputStream.transferTo(fileInputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteInput(String key) {
        s3Client.deleteObject(downloadBucket, key);
    }

    public void deleteOutput(String key) {
        s3Client.deleteObject(uploadBucket, key);
    }

    public void uploadFolder(File[] files, UUID videoId, int size) {
        if (files != null) {
            for (File f : files) {
                String s3Key = videoId + "/" + size + "/" + f.getName();
                upload(f, s3Key);
            }
        }
    }

    public String uploadBytes(byte[] data, String key) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(data.length);
        metadata.setContentType("application/x-mpegURL"); // Важно для HLS плейлистов

        try (InputStream inputStream = new ByteArrayInputStream(data)) {
            s3Client.putObject(new PutObjectRequest(uploadBucket, key, inputStream, metadata));
            log.info("Master playlist uploaded to S3: {}", key);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload bytes to S3", e);
        }
        return s3Endpoint + "/" + uploadBucket + "/" + key;
    }

    public String uploadThumbnail(UUID videoId, File file) {
        String key = videoId.toString() + ".jpg";
        s3Client.putObject(new PutObjectRequest(thumbnailBucket, key, file));
        return key;
    }
}
