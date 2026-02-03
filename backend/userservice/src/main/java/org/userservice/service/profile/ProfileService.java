package org.userservice.service.profile;

import org.userservice.dto.profile.ProfileDtoIn;
import org.userservice.dto.profile.ProfileDtoOut;;

public interface ProfileService {

    ProfileDtoOut updateProfile(ProfileDtoIn request);

    ProfileDtoOut getProfile(Long userId);
}