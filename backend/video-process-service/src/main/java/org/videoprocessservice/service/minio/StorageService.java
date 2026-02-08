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

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final AmazonS3 s3Client;

    @Value("${app.s3.download_bucket}")
    private String downloadBucket;

    @Value("${app.s3.upload_bucket}")
    private String uploadBucket;

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
}
