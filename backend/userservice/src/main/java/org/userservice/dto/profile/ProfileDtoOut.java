package org.userservice.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDtoOut {
    private Long userId;
    private String firstName;
    private String lastName;
    private String bio;
    private String location;
    private LocalDate birthDate;
    private String gender;
    private LocalDateTime updatedAt;
}