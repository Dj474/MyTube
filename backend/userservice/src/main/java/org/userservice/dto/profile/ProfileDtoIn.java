package org.userservice.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDtoIn {
    private String firstName;
    private String lastName;
    private String bio;
    private String location;
    private LocalDate birthDate;
    private String gender;
}