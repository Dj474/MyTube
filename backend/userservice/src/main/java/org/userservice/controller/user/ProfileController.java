package org.userservice.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.userservice.dto.profile.ProfileDtoIn;
import org.userservice.dto.profile.ProfileDtoOut;
import org.userservice.service.profile.ProfileService;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PutMapping("/me")
    public ProfileDtoOut updateMyProfile(@Valid @RequestBody ProfileDtoIn request) {
        return profileService.updateProfile(request);
    }

    @GetMapping("/{userId}")
    public ProfileDtoOut getUserProfile(@PathVariable Long userId) {
        return profileService.getProfile(userId);
    }

    @PostMapping("/photo")
    public void uploadPhoto(MultipartFile file) {
        profileService.uploadPhoto(file);
    }

    @GetMapping("/photo/{userId}")
    public ResponseEntity<Resource> getPhoto(@PathVariable Long userId) {
        return profileService.getPhoto(userId);
    }

}