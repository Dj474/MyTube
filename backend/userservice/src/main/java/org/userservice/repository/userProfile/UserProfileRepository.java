package org.userservice.repository.userProfile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.userservice.entity.userProfile.UserProfile;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}
