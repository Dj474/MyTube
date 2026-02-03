package org.userservice.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.userservice.dto.profile.ProfileDtoIn;
import org.userservice.dto.profile.ProfileDtoOut;
import org.userservice.service.profile.ProfileService;

@RestController
@RequestMapping("/api/profile")
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
}