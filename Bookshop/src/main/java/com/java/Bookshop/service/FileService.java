package com.java.Bookshop.service;

import com.java.Bookshop.exception.EmptyFileException;
import com.java.Bookshop.exception.FileUploadException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new EmptyFileException("Файл порожній");
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename().replace(" ", "_");

        try {
            PutObjectRequest putOb = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putOb, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;

        } catch (IOException e) {
            throw new FileUploadException("Помилка завантаження файлу в S3", e);
        }
    }

    public void deleteFileFromS3(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("amazonaws.com")) {
            return;
        }

        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            System.out.println("Старый файл " + fileName + " успешно удален из S3");

        } catch (Exception e) {
            System.err.println("Ошибка при удалении файла из S3: " + e.getMessage());
        }
    }
}