package com.pms.backend.doctor.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.doctor.dto.DoctorDto;
import com.pms.backend.doctor.entity.Doctor;
import com.pms.backend.doctor.repository.DoctorRepository;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorDto createDoctor(Long userId, DoctorDto doctorDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (doctorRepository.existsByUserId(userId)) {
            throw new AppException("Doctor profile already exists for this user", HttpStatus.CONFLICT);
        }

        if (doctorDto.getLicenseNumber() != null && doctorRepository.findByLicenseNumber(doctorDto.getLicenseNumber()).isPresent()) {
            throw new AppException("License number already exists", HttpStatus.CONFLICT);
        }

        Doctor doctor = Doctor.builder()
                .user(user)
                .specialization(doctorDto.getSpecialization())
                .licenseNumber(doctorDto.getLicenseNumber())
                .hospital(doctorDto.getHospital())
                .department(doctorDto.getDepartment())
                .consultationFee(doctorDto.getConsultationFee())
                .bio(doctorDto.getBio())
                .isAvailable(doctorDto.getIsAvailable() != null ? doctorDto.getIsAvailable() : true)
                .build();

        Doctor savedDoctor = doctorRepository.save(doctor);
        return convertToDto(savedDoctor);
    }

    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException("Doctor not found", HttpStatus.NOT_FOUND));
        if (doctor.getUser() == null) {
            throw new AppException("Doctor profile has no linked user", HttpStatus.CONFLICT);
        }
        return convertToDto(doctor);
    }

    public DoctorDto getDoctorByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // For non-DOCTOR roles (e.g., NURSE), return basic user info
        if (user.getRole() != com.pms.backend.role.entity.Role.DOCTOR) {
            return DoctorDto.builder()
                    .userId(user.getId())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .mobileNumber(user.getMobileNumber())
                    .build();
        }

        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Doctor profile not found", HttpStatus.NOT_FOUND));
        if (doctor.getUser() == null) {
            throw new AppException("Doctor profile has no linked user", HttpStatus.CONFLICT);
        }
        return convertToDto(doctor);
    }

    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::convertToDto)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<DoctorDto> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization).stream()
                .map(this::convertToDto)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<DoctorDto> getAvailableDoctors() {
        return doctorRepository.findByIsAvailableTrue().stream()
                .map(this::convertToDto)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public DoctorDto updateDoctor(Long id, DoctorDto doctorDto) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException("Doctor not found", HttpStatus.NOT_FOUND));

        if (doctorDto.getSpecialization() != null) {
            doctor.setSpecialization(doctorDto.getSpecialization());
        }
        if (doctorDto.getHospital() != null) {
            doctor.setHospital(doctorDto.getHospital());
        }
        if (doctorDto.getDepartment() != null) {
            doctor.setDepartment(doctorDto.getDepartment());
        }
        if (doctorDto.getConsultationFee() != null) {
            doctor.setConsultationFee(doctorDto.getConsultationFee());
        }
        if (doctorDto.getBio() != null) {
            doctor.setBio(doctorDto.getBio());
        }
        if (doctorDto.getIsAvailable() != null) {
            doctor.setIsAvailable(doctorDto.getIsAvailable());
        }

        Doctor updatedDoctor = doctorRepository.save(doctor);
        return convertToDto(updatedDoctor);
    }

    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new AppException("Doctor not found", HttpStatus.NOT_FOUND));
        doctorRepository.delete(doctor);
    }

    private DoctorDto convertToDto(Doctor doctor) {
        User user = doctor.getUser();
        if (user == null) {
            return null;
        }
        return DoctorDto.builder()
                .id(doctor.getId())
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .specialization(doctor.getSpecialization())
                .licenseNumber(doctor.getLicenseNumber())
                .hospital(doctor.getHospital())
                .department(doctor.getDepartment())
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .isAvailable(doctor.getIsAvailable())
                .createdAt(doctor.getCreatedAt())
                .updatedAt(doctor.getUpdatedAt())
                .build();
    }
}

