package org.userservice.repository.userProfile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.userservice.entity.profile.Profile;

@Repository
public interface UserProfileRepository extends JpaRepository<Profile, Long> {
}
