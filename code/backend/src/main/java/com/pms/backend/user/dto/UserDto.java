package com.pms.backend.user.dto;

import com.pms.backend.role.entity.Role;
import com.pms.backend.user.entity.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private Role role;
    // Notice: passwordHash is intentionally NOT here.
    // If you return the User entity directly from a controller,
    // the password hash gets sent to the browser — huge security problem.

    // Static factory: safely converts User entity → UserDto
    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .mobileNumber(user.getMobileNumber())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
