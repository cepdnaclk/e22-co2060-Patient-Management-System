package com.pms.backend.file;

import com.pms.backend.common.exception.AppException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileService {

    @Value("${app.upload.dir:uploads/lab-reports}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:10485760}")
    private long maxFileSize;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
    }

    public String storeFile(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new AppException("File must have a name", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > maxFileSize) {
            throw new AppException("File exceeds maximum size of " + (maxFileSize / 1024 / 1024) + "MB", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null ||
            (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            throw new AppException("Only PDF and image files are allowed", HttpStatus.BAD_REQUEST);
        }

        String extension = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx > 0) {
            extension = originalName.substring(dotIdx);
        }
        String storedName = UUID.randomUUID().toString() + extension;

        try {
            Path target = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return storedName;
        } catch (IOException e) {
            throw new AppException("Failed to store file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public Resource loadFile(String fileName) {
        try {
            Path file = uploadPath.resolve(fileName).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new AppException("File not found: " + fileName, HttpStatus.NOT_FOUND);
        } catch (MalformedURLException e) {
            throw new AppException("File not found: " + fileName, HttpStatus.NOT_FOUND);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path file = uploadPath.resolve(fileName).normalize();
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new AppException("Failed to delete file: " + fileName, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
