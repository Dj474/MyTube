package org.userservice.service.profile.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.userservice.dto.profile.ProfileDtoIn;
import org.userservice.dto.profile.ProfileDtoOut;
import org.userservice.entity.profile.Profile;
import org.userservice.entity.user.User;
import org.userservice.exception.NotFoundException;
import org.userservice.repository.user.UserRepository;
import org.userservice.repository.userProfile.UserProfileRepository;
import org.userservice.service.minio.StorageService;
import org.userservice.service.profile.ProfileService;
import org.userservice.service.user.UserService;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserService userService;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Override
    @Transactional
    public ProfileDtoOut updateProfile(ProfileDtoIn request) {
        User currentUser = userService.getCurrent();
        Profile profile = currentUser.getProfile();

        // Обновляем поля, если они не null в запросе
        if (request.getFirstName() != null) {
            profile.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getBirthDate() != null) {
            profile.setBirthDate(request.getBirthDate());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }

        Profile savedProfile = userProfileRepository.save(profile);

        return convertToResponse(savedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileDtoOut getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        return getProfileResponse(user);
    }

    @Override
    public void uploadPhoto(MultipartFile file) {
        User user = userService.getCurrent();
        String key = user.getId() + ".jpg";
        storageService.uploadPhoto(file, key);
        Profile profile = user.getProfile();
        profile.setPhotoUrl("http://localhost:8090/api/v1/profile/photo/" + user.getId());
        userProfileRepository.save(profile);
    }

    @Override
    public ResponseEntity<Resource> getPhoto(Long userId) {
        User user = userRepository.byId(userId);
        InputStream is = storageService.getPhoto(userId + ".jpg");
        Resource res = new InputStreamResource(is);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(res);
    }

    private ProfileDtoOut getProfileResponse(User user) {
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new NotFoundException("Profile not found for user: " + user.getId());
        }
        return convertToResponse(profile);
    }

    private ProfileDtoOut convertToResponse(Profile profile) {
        return ProfileDtoOut.builder()
                .userId(profile.getUser().getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .birthDate(profile.getBirthDate())
                .gender(profile.getGender())
                .updatedAt(profile.getUpdatedAt())
                .photoUrl(profile.getPhotoUrl())
                .build();
    }
}