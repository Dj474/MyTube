package org.videoservice.other.enums;

public enum VideoStatus {
    UPLOADING,   // Файл загружается в S3
    PROCESSING,  // FFmpeg нарезает HLS
    READY,       // Можно смотреть
    ERROR        // Что-то пошло не так
}