package org.userservice.controller.subscription;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.userservice.dto.subscription.SubscriptionDtoOut;
import org.userservice.service.subscription.SubscriptionService;
import org.userservice.specification.PageableParams;

@RestController
@RequestMapping("/api/v1/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping()
    public void subscribe(@RequestParam Long authorId) {
        subscriptionService.subscribe(authorId);
    }

    @DeleteMapping()
    public void unsubscribe(@RequestParam Long authorId) {
        subscriptionService.unsubscribe(authorId);
    }

    @GetMapping()
    public Page<SubscriptionDtoOut> getSubscriptions(PageableParams params) {
        return subscriptionService.getSubscriptions(params);
    }

}
