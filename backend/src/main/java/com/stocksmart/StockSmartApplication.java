package com.stocksmart;

import com.stocksmart.entity.Role;
import com.stocksmart.entity.User;
import com.stocksmart.repository.RoleRepository;
import com.stocksmart.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@SpringBootApplication
public class StockSmartApplication {

    public static void main(String[] args) {
        SpringApplication.run(StockSmartApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDemoUsers(UserRepository userRepository,
                                          RoleRepository roleRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").description("Administrator").build()));
            Role managerRole = roleRepository.findByName("ROLE_INVENTORY_MANAGER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_INVENTORY_MANAGER").description("Manager").build()));
            Role staffRole = roleRepository.findByName("ROLE_STAFF")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STAFF").description("Staff").build()));

            userRepository.findByUsername("admin").ifPresentOrElse(
                    u -> {
                        u.setPassword(passwordEncoder.encode("Admin@123"));
                        userRepository.save(u);
                    },
                    () -> userRepository.save(User.builder()
                            .username("admin").email("admin@stocksmart.com")
                            .password(passwordEncoder.encode("Admin@123"))
                            .firstName("System").lastName("Admin").active(true)
                            .roles(Set.of(adminRole, managerRole, staffRole)).build())
            );

            userRepository.findByUsername("manager").ifPresentOrElse(
                    u -> {
                        u.setPassword(passwordEncoder.encode("Manager@123"));
                        userRepository.save(u);
                    },
                    () -> userRepository.save(User.builder()
                            .username("manager").email("manager@stocksmart.com")
                            .password(passwordEncoder.encode("Manager@123"))
                            .firstName("Inventory").lastName("Manager").active(true)
                            .roles(Set.of(managerRole, staffRole)).build())
            );

            userRepository.findByUsername("staff").ifPresentOrElse(
                    u -> {
                        u.setPassword(passwordEncoder.encode("Staff@123"));
                        userRepository.save(u);
                    },
                    () -> userRepository.save(User.builder()
                            .username("staff").email("staff@stocksmart.com")
                            .password(passwordEncoder.encode("Staff@123"))
                            .firstName("Staff").lastName("User").active(true)
                            .roles(Set.of(staffRole)).build())
            );
        };
    }
}
