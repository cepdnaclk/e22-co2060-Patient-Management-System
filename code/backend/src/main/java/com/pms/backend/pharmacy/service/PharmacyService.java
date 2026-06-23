package com.pms.backend.pharmacy.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.pharmacy.dto.MedicineDto;
import com.pms.backend.pharmacy.entity.Medicine;
import com.pms.backend.pharmacy.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PharmacyService {

    private final MedicineRepository medicineRepository;

    @Transactional(readOnly = true)
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Medicine> getLowStockMedicines() {
        return medicineRepository.findLowStockMedicines();
    }

    @Transactional
    public Medicine addMedicine(MedicineDto dto) {
        Medicine medicine = Medicine.builder()
                .name(dto.getName())
                .genericName(dto.getGenericName())
                .manufacturer(dto.getManufacturer())
                .stockQuantity(dto.getStockQuantity())
                .unitPrice(dto.getUnitPrice())
                .expiryDate(dto.getExpiryDate())
                .build();
        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine updateMedicine(Long id, MedicineDto dto) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Medicine not found"));

        medicine.setName(dto.getName());
        medicine.setGenericName(dto.getGenericName());
        medicine.setManufacturer(dto.getManufacturer());
        medicine.setStockQuantity(dto.getStockQuantity());
        medicine.setUnitPrice(dto.getUnitPrice());
        medicine.setExpiryDate(dto.getExpiryDate());

        return medicineRepository.save(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw AppException.notFound("Medicine not found");
        }
        medicineRepository.deleteById(id);
    }
}
