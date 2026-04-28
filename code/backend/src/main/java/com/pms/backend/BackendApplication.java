package com.pms.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		// 1. Check the variable first
		String secret = System.getenv("JWT_SECRET");

		System.out.println("=======================================");
		System.out.println("JWT Secret check: " + (secret != null ? "FOUND " : "NOT FOUND "));
		System.out.println("=======================================");

		// 2. Then start the Spring app
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedSuperAdmin(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			@Value("${app.superadmin.email}") String email,
			@Value("${app.superadmin.password}") String password,
			@Value("${app.superadmin.first-name}") String firstName,
			@Value("${app.superadmin.last-name}") String lastName,
			@Value("${app.superadmin.mobile-number}") String mobileNumber
	) {
		return args -> {
			if (userRepository.countByRole(Role.SUPER_ADMIN) > 0) {
				return;
			}

			userRepository.findByEmail(email).ifPresentOrElse(existing -> {
				existing.setRole(Role.SUPER_ADMIN);
				existing.setActive(true);
				userRepository.save(existing);
			}, () -> {
				User user = User.builder()
						.firstName(firstName)
						.lastName(lastName)
						.email(email)
						.mobileNumber(mobileNumber)
						.passwordHash(passwordEncoder.encode(password))
						.role(Role.SUPER_ADMIN)
						.isActive(true)
						.build();
				userRepository.save(user);
			});
		};
	}
}