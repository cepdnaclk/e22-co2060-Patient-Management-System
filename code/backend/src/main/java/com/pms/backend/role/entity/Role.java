package com.pms.backend.role.entity;

import jakarta.persistence.*;

// An enum is a fixed set of named constants.
// Using an enum means you cannot accidentally have a typo like "DOCTOR".
// These names are stored as strings in the database (e.g. "DOCTOR", "PATIENT").

public enum Role {
    SUPER_ADMIN,     // Full access to everything
    ADMIN,           // Manages users, views reports
    MANAGEMENT,      // User & staff management (excluding Admin accounts)
    DOCTOR,          // Full clinical access
    NURSE,           // Record vitals, assist doctors
    RECEPTIONIST,    // Book appointments, register patients
    PHARMACIST,      // Manage prescriptions
    LAB_TECHNICIAN,  // Enter lab results
    BILLING_STAFF,   // Billing and payments only
    PATIENT          // Own records only
}
