package org.userservice.mapper.subscription;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.userservice.dto.subscription.SubscriptionDtoOut;
import org.userservice.entity.subscription.Subscription;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {

    @Mapping(target = "authorId", source = "subscription.author.id")
    @Mapping(target = "nickname", source = "subscription.author.name")
    SubscriptionDtoOut toDto(Subscription subscription);

}
