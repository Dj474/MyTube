package org.userservice.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.userservice.entity.user.User;
import org.userservice.exception.NotFoundException;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String login);

    Optional<User> findByEmail(String login);

    default User byId(Long id) {
        return findById(id).orElseThrow(() -> new NotFoundException("User with id = " + id + " not exists"));
    }
}
