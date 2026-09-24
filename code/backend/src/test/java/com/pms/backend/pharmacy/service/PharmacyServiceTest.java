package com.pms.backend.pharmacy.service;

import com.pms.backend.common.exception.AppException;
import com.pms.backend.pharmacy.dto.MedicineDto;
import com.pms.backend.pharmacy.entity.Medicine;
import com.pms.backend.pharmacy.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PharmacyServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private PharmacyService pharmacyService;

    @Test
    void testGetLowStockMedicines_CallsRepository() {
        Medicine med1 = Medicine.builder().id(1L).name("Paracetamol").stockQuantity(5).build();
        Medicine med2 = Medicine.builder().id(2L).name("Amoxicillin").stockQuantity(10).build();
        when(medicineRepository.findLowStockMedicines()).thenReturn(List.of(med1, med2));

        List<Medicine> result = pharmacyService.getLowStockMedicines();

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(m -> m.getStockQuantity() <= 10));
        verify(medicineRepository, times(1)).findLowStockMedicines();
    }

    @Test
    void testAddMedicine_SavesEntity() {
        MedicineDto dto = new MedicineDto();
        dto.setName("Ibuprofen 400mg");
        dto.setGenericName("Ibuprofen");
        dto.setManufacturer("Pfizer");
        dto.setStockQuantity(100);
        dto.setUnitPrice(new BigDecimal("12.50"));
        dto.setExpiryDate(LocalDate.now().plusYears(2));

        Medicine saved = Medicine.builder()
                .id(10L)
                .name("Ibuprofen 400mg")
                .genericName("Ibuprofen")
                .manufacturer("Pfizer")
                .stockQuantity(100)
                .unitPrice(new BigDecimal("12.50"))
                .expiryDate(dto.getExpiryDate())
                .build();
        when(medicineRepository.save(any(Medicine.class))).thenReturn(saved);

        Medicine result = pharmacyService.addMedicine(dto);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("Ibuprofen 400mg", result.getName());
        verify(medicineRepository, times(1)).save(any(Medicine.class));
    }

    @Test
    void testUpdateMedicine_UpdatesFields() {
        Medicine existing = Medicine.builder()
                .id(10L)
                .name("Old Name")
                .stockQuantity(50)
                .unitPrice(new BigDecimal("10.00"))
                .build();
        when(medicineRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(medicineRepository.save(any(Medicine.class))).thenAnswer(inv -> inv.getArgument(0));

        MedicineDto updateDto = new MedicineDto();
        updateDto.setName("New Name");
        updateDto.setGenericName("Generic");
        updateDto.setManufacturer("Manufacturer");
        updateDto.setStockQuantity(75);
        updateDto.setUnitPrice(new BigDecimal("15.00"));
        updateDto.setExpiryDate(LocalDate.now().plusYears(1));

        Medicine result = pharmacyService.updateMedicine(10L, updateDto);

        assertNotNull(result);
        assertEquals("New Name", result.getName());
        assertEquals(75, result.getStockQuantity());
        assertEquals(new BigDecimal("15.00"), result.getUnitPrice());
    }

    @Test
    void testDeleteMedicine_NotFound_ThrowsException() {
        when(medicineRepository.existsById(99L)).thenReturn(false);

        AppException exception = assertThrows(AppException.class, () -> {
            pharmacyService.deleteMedicine(99L);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertEquals("Medicine not found", exception.getMessage());
        verify(medicineRepository, never()).deleteById(any());
    }
}
