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

import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync        // Enables @Async on AuditLogService
@EnableScheduling   // Enables scheduled token cleanup tasks
public class BackendApplication {

	public static void main(String[] args) {
		loadDotenv();

		// 1. Check the variable first
		String secret = System.getenv("JWT_SECRET");
		if (secret == null) {
			secret = System.getProperty("JWT_SECRET");
		}

		String mailUser = System.getenv("MAIL_USERNAME");
		if (mailUser == null) {
			mailUser = System.getProperty("MAIL_USERNAME");
		}

		System.out.println("=======================================");
		System.out.println("JWT Secret check: " + (secret != null ? "FOUND" : "NOT FOUND"));
		System.out.println("Mail User check:  " + (mailUser != null ? mailUser : "NOT FOUND (defaulting)"));
		System.out.println("=======================================");

		// 2. Then start the Spring app
		SpringApplication.run(BackendApplication.class, args);
	}

	private static void loadDotenv() {
		java.io.File[] candidates = new java.io.File[] {
				new java.io.File(".env"),
				new java.io.File("backend/.env"),
				new java.io.File("code/backend/.env"),
				new java.io.File("../.env")
		};

		for (java.io.File file : candidates) {
			if (file.exists() && file.isFile()) {
				try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(file))) {
					String line;
					while ((line = reader.readLine()) != null) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#")) {
							continue;
						}
						// Support both standard multiline .env and semicolon-separated lines
						String[] entries = line.split(";");
						for (String entry : entries) {
							entry = entry.trim();
							if (entry.isEmpty() || entry.startsWith("#")) {
								continue;
							}
							int eqIdx = entry.indexOf('=');
							if (eqIdx > 0) {
								String key = entry.substring(0, eqIdx).trim();
								String val = entry.substring(eqIdx + 1).trim();
								if ((val.startsWith("\"") && val.endsWith("\"")) ||
										(val.startsWith("'") && val.endsWith("'"))) {
									val = val.substring(1, val.length() - 1);
								}
								if (System.getProperty(key) == null && System.getenv(key) == null) {
									System.setProperty(key, val);
								}
							}
						}
					}
					System.out.println("[BackendApplication] Loaded environment from: " + file.getAbsolutePath());
					break;
				} catch (Exception e) {
					System.err.println("[BackendApplication] Warning: Failed to parse " + file.getName() + ": " + e.getMessage());
				}
			}
		}
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