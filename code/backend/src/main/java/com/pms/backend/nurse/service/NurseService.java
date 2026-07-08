package com.pms.backend.nurse.service;

import com.pms.backend.nurse.dto.ClinicalOrderDto;
import com.pms.backend.nurse.dto.MedAdministrationDto;
import com.pms.backend.nurse.dto.MedicationOrderDto;
import com.pms.backend.nurse.dto.VitalsRecordDto;
import com.pms.backend.nurse.entity.ClinicalOrder;
import com.pms.backend.nurse.entity.MedAdministration;
import com.pms.backend.nurse.entity.MedicationOrder;
import com.pms.backend.nurse.entity.VitalsRecord;
import com.pms.backend.nurse.repository.ClinicalOrderRepository;
import com.pms.backend.nurse.repository.MedAdministrationRepository;
import com.pms.backend.nurse.repository.MedicationOrderRepository;
import com.pms.backend.nurse.repository.VitalsRecordRepository;
import com.pms.backend.patient.entity.Patient;
import com.pms.backend.patient.repository.PatientRepository;
import com.pms.backend.user.entity.User;
import com.pms.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NurseService {

    private final VitalsRecordRepository vitalsRecordRepository;
    private final MedicationOrderRepository medicationOrderRepository;
    private final MedAdministrationRepository medAdministrationRepository;
    private final ClinicalOrderRepository clinicalOrderRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    // --- VITALS ---
    
    public List<VitalsRecordDto> getPatientVitals(Long patientId) {
        return vitalsRecordRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .stream().map(this::mapToVitalsDto).collect(Collectors.toList());
    }

    @Transactional
    public VitalsRecordDto recordVitals(VitalsRecordDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        User nurse = null;
        if (dto.getNurseId() != null) {
            nurse = userRepository.findById(dto.getNurseId()).orElse(null);
        }

        VitalsRecord record = VitalsRecord.builder()
                .patient(patient)
                .nurse(nurse)
                .bloodPressure(dto.getBloodPressure())
                .heartRate(dto.getHeartRate())
                .temperature(dto.getTemperature())
                .oxygenSaturation(dto.getOxygenSaturation())
                .respiratoryRate(dto.getRespiratoryRate())
                .build();
                
        record = vitalsRecordRepository.save(record);
        return mapToVitalsDto(record);
    }

    // --- MAR (Medication Orders & Admin) ---

    public List<MedicationOrderDto> getPatientMedicationOrders(Long patientId) {
        List<MedicationOrder> orders = medicationOrderRepository.findByPatientId(patientId);
        return orders.stream().map(this::mapToMedOrderDto).collect(Collectors.toList());
    }

    @Transactional
    public MedicationOrderDto createMedicationOrder(MedicationOrderDto dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        MedicationOrder order = MedicationOrder.builder()
                .patient(patient)
                .medicationName(dto.getMedicationName())
                .dosage(dto.getDosage())
                .frequency(dto.getFrequency())
                .icd10Code(dto.getIcd10Code())
                .status("ACTIVE")
                .startDate(LocalDateTime.now())
                .build();
                
        order = medicationOrderRepository.save(order);
        return mapToMedOrderDto(order);
    }

    @Transactional
    public MedAdministrationDto administerMedication(MedAdministrationDto dto) {
        MedicationOrder order = medicationOrderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Medication Order not found"));
                
        User nurse = null;
        if (dto.getNurseId() != null) {
            nurse = userRepository.findById(dto.getNurseId()).orElse(null);
        }

        MedAdministration admin = MedAdministration.builder()
                .order(order)
                .nurse(nurse)
                .status(dto.getStatus())
                .notes(dto.getNotes())
                .build();
                
        admin = medAdministrationRepository.save(admin);
        return mapToMedAdminDto(admin);
    }

    // --- CLINICAL ORDERS ---

    public List<ClinicalOrderDto> getPatientClinicalOrders(Long patientId) {
        return clinicalOrderRepository.findByPatientId(patientId)
                .stream().map(this::mapToClinicalOrderDto).collect(Collectors.toList());
    }

    @Transactional
    public ClinicalOrderDto completeClinicalOrder(Long orderId, Long userId) {
        ClinicalOrder order = clinicalOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Clinical Order not found"));
        
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        order.setStatus("COMPLETED");
        order.setCompletedAt(LocalDateTime.now());
        order.setCompletedBy(user);
        
        order = clinicalOrderRepository.save(order);
        return mapToClinicalOrderDto(order);
    }

    // --- MAPPERS ---
    
    private VitalsRecordDto mapToVitalsDto(VitalsRecord entity) {
        return VitalsRecordDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatient().getId())
                .nurseId(entity.getNurse() != null ? entity.getNurse().getId() : null)
                .bloodPressure(entity.getBloodPressure())
                .heartRate(entity.getHeartRate())
                .temperature(entity.getTemperature())
                .oxygenSaturation(entity.getOxygenSaturation())
                .respiratoryRate(entity.getRespiratoryRate())
                .recordedAt(entity.getRecordedAt())
                .build();
    }

    private MedicationOrderDto mapToMedOrderDto(MedicationOrder entity) {
        List<MedAdministrationDto> admins = entity.getAdministrations().stream()
                .map(this::mapToMedAdminDto).collect(Collectors.toList());
                
        // Calculate due time / urgency logic for frontend
        String status = "pending";
        if (admins.stream().anyMatch(a -> a.getAdministeredAt().toLocalDate().equals(LocalDateTime.now().toLocalDate()) 
            && a.getStatus().equals("GIVEN"))) {
            status = "given";
        }

        return MedicationOrderDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatient().getId())
                .doctorId(entity.getDoctor() != null ? entity.getDoctor().getId() : null)
                .doctorName(entity.getDoctor() != null ? entity.getDoctor().getUser().getFirstName() + " " + entity.getDoctor().getUser().getLastName() : null)
                .medicationName(entity.getMedicationName())
                .dosage(entity.getDosage())
                .frequency(entity.getFrequency())
                .icd10Code(entity.getIcd10Code())
                .status(entity.getStatus())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .createdAt(entity.getCreatedAt())
                .dueTime(entity.getFrequency()) // fallback
                .urgency("normal") // default
                .currentStatus(status)
                .administrations(admins)
                .build();
    }

    private MedAdministrationDto mapToMedAdminDto(MedAdministration entity) {
        return MedAdministrationDto.builder()
                .id(entity.getId())
                .orderId(entity.getOrder().getId())
                .nurseId(entity.getNurse() != null ? entity.getNurse().getId() : null)
                .nurseName(entity.getNurse() != null ? entity.getNurse().getFirstName() + " " + entity.getNurse().getLastName() : null)
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .administeredAt(entity.getAdministeredAt())
                .build();
    }

    private ClinicalOrderDto mapToClinicalOrderDto(ClinicalOrder entity) {
        return ClinicalOrderDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatient().getId())
                .doctorId(entity.getDoctor() != null ? entity.getDoctor().getId() : null)
                .doctorName(entity.getDoctor() != null ? entity.getDoctor().getUser().getFirstName() + " " + entity.getDoctor().getUser().getLastName() : null)
                .orderType(entity.getOrderType())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .completedAt(entity.getCompletedAt())
                .completedById(entity.getCompletedBy() != null ? entity.getCompletedBy().getId() : null)
                .completedByName(entity.getCompletedBy() != null ? entity.getCompletedBy().getFirstName() + " " + entity.getCompletedBy().getLastName() : null)
                .build();
    }
}
