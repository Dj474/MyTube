package org.userservice.service.profile;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import org.userservice.dto.profile.ProfileDtoIn;
import org.userservice.dto.profile.ProfileDtoOut;

public interface ProfileService {

    ProfileDtoOut updateProfile(ProfileDtoIn request);

    ProfileDtoOut getProfile(Long userId);

    void uploadPhoto(MultipartFile file);

    ResponseEntity<Resource> getPhoto(Long userId);
}