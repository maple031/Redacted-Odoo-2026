package com.stocksense.users;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DemoDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataInitializer(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByLoginIdIgnoreCase("john.doe")) {
            log.info("Demo user 'john.doe' not found. Creating demo user...");
            AppUser john = new AppUser(
                "john.doe",
                "john.doe@example.com",
                passwordEncoder.encode("Password123!")
            );
            userRepository.save(john);
            log.info("Demo user 'john.doe' created successfully with password: Password123!");
        } else {
            log.info("Demo user 'john.doe' already exists.");
        }
    }
}
