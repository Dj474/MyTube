package org.userservice.service.profile.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.userservice.dto.profile.ProfileDtoIn;
import org.userservice.dto.profile.ProfileDtoOut;
import org.userservice.entity.profile.Profile;
import org.userservice.entity.user.User;
import org.userservice.exception.NotFoundException;
import org.userservice.repository.user.UserRepository;
import org.userservice.repository.userProfile.UserProfileRepository;
import org.userservice.service.profile.ProfileService;
import org.userservice.service.user.UserService;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserService userService;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ProfileDtoOut updateProfile(ProfileDtoIn request) {
        User currentUser = userService.getCurrent();
        Profile profile = getOrCreateUserProfile(currentUser);

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

    private ProfileDtoOut getProfileResponse(User user) {
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new NotFoundException("Profile not found for user: " + user.getId());
        }
        return convertToResponse(profile);
    }

    private Profile getOrCreateUserProfile(User user) {
        Profile profile = user.getProfile();
        if (profile == null) {
            // Создаем новый профиль, если его нет
            profile = Profile.builder()
                    .user(user)
                    .build();
            user.setProfile(profile);
            userRepository.save(user);
        }
        return profile;
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
                .build();
    }
}