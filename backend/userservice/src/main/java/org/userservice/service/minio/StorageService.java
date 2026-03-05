package org.userservice.service.minio;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final AmazonS3 s3Client;

    @Value("${app.s3.bucket}")
    private String bucket;

    public String uploadPhoto(MultipartFile file, String key) {
        try {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            log.info("Загрузка фото в S3: {}", key);

            s3Client.putObject(new PutObjectRequest(bucket, key, file.getInputStream(), metadata));

            return key;
        } catch (IOException e) {
            log.error("Ошибка при чтении файла для S3", e);
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    public InputStream getPhoto(String key) {
        return s3Client.getObject(bucket, key).getObjectContent();
    }

}
