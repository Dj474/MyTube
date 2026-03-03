package org.userservice.service.profile;

import org.springframework.data.domain.Page;
import org.userservice.dto.profile.ProfileDtoIn;
import org.userservice.dto.profile.ProfileDtoOut;;

public interface ProfileService {

    ProfileDtoOut updateProfile(ProfileDtoIn request);

    ProfileDtoOut getProfile(Long userId);

    Page<ProfileDtoOut> findProfiles(String nickname);
}