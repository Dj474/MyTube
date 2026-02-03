package org.userservice.service.user;

import org.springframework.stereotype.Service;
import org.userservice.entity.user.User;

public interface UserService {

    User getCurrent();

}
