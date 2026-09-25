package com.pms.backend.file;

import com.pms.backend.common.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("FileService Unit Tests")
class FileServiceTest {

    private FileService fileService;

    @TempDir
    Path tempUploadDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @BeforeEach
    void setUp() {
        fileService = new FileService();
        ReflectionTestUtils.setField(fileService, "uploadDir", tempUploadDir.toString());
        ReflectionTestUtils.setField(fileService, "maxFileSize", MAX_FILE_SIZE);
        fileService.init();
    }

    @Nested
    @DisplayName("storeFile()")
    class StoreFileTests {

        @Test
        @DisplayName("Happy path: stores PNG image and returns unique filename")
        void storeFile_ImagePng_Success() {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "xray-chest.png",
                    "image/png",
                    "fake-png-content".getBytes()
            );

            String storedName = fileService.storeFile(file);

            assertThat(storedName).isNotBlank();
            assertThat(storedName).endsWith(".png");
            assertThat(Files.exists(tempUploadDir.resolve(storedName))).isTrue();
        }

        @Test
        @DisplayName("Happy path: stores PDF report and returns unique filename")
        void storeFile_Pdf_Success() {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "blood-work.pdf",
                    "application/pdf",
                    "fake-pdf-content".getBytes()
            );

            String storedName = fileService.storeFile(file);

            assertThat(storedName).isNotBlank();
            assertThat(storedName).endsWith(".pdf");
            assertThat(Files.exists(tempUploadDir.resolve(storedName))).isTrue();
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST when filename is empty or blank")
        void storeFile_MissingFilename() {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "",
                    "image/png",
                    "content".getBytes()
            );

            assertThatThrownBy(() -> fileService.storeFile(file))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(appEx.getMessage()).isEqualTo("File must have a name");
                    });
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST when file exceeds maximum allowed size")
        void storeFile_ExceedsMaxFileSize() {
            // Configure tiny max file size (10 bytes)
            ReflectionTestUtils.setField(fileService, "maxFileSize", 10L);

            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "large-scan.jpg",
                    "image/jpeg",
                    "123456789012345".getBytes() // 15 bytes
            );

            assertThatThrownBy(() -> fileService.storeFile(file))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(appEx.getMessage()).contains("File exceeds maximum size");
                    });
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST when content type is neither image nor PDF")
        void storeFile_DisallowedContentType() {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "malicious-script.exe",
                    "application/x-msdownload",
                    "binary-content".getBytes()
            );

            assertThatThrownBy(() -> fileService.storeFile(file))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(appEx.getMessage()).isEqualTo("Only PDF and image files are allowed");
                    });
        }

        @Test
        @DisplayName("Fails with 400 BAD_REQUEST when content type is text/plain")
        void storeFile_TextPlain_Disallowed() {
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "notes.txt",
                    "text/plain",
                    "text-content".getBytes()
            );

            assertThatThrownBy(() -> fileService.storeFile(file))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
        }
    }

    @Nested
    @DisplayName("loadFile() and deleteFile()")
    class LoadAndDeleteTests {

        @Test
        @DisplayName("loadFile: loads existing file resource successfully")
        void loadFile_Success() throws IOException {
            Path created = Files.createFile(tempUploadDir.resolve("test-doc.pdf"));
            Files.writeString(created, "dummy-content");

            Resource resource = fileService.loadFile("test-doc.pdf");

            assertThat(resource).isNotNull();
            assertThat(resource.exists()).isTrue();
            assertThat(resource.isReadable()).isTrue();
        }

        @Test
        @DisplayName("loadFile: fails with 404 NOT_FOUND when file does not exist")
        void loadFile_NotFound() {
            assertThatThrownBy(() -> fileService.loadFile("non-existent-report.pdf"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(appEx.getMessage()).contains("File not found");
                    });
        }

        @Test
        @DisplayName("deleteFile: removes existing file from disk")
        void deleteFile_Success() throws IOException {
            Path created = Files.createFile(tempUploadDir.resolve("to-delete.pdf"));
            assertThat(Files.exists(created)).isTrue();

            fileService.deleteFile("to-delete.pdf");

            assertThat(Files.exists(created)).isFalse();
        }
    }
}
