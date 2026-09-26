---
# Patient Management System

---

## Team
- **E/22/364** – S.M.L.E Senadhipathi ([e22364@eng.pdn.ac.lk](mailto:e22364@eng.pdn.ac.lk))
- **E/22/125** – D.D.S.K. Gunawardhana ([e22125@eng.pdn.ac.lk](mailto:e22125@eng.pdn.ac.lk))
- **E/22/159** – G.K.M. Jayanga ([e22159@eng.pdn.ac.lk](mailto:e22159@eng.pdn.ac.lk))
- **E/22/004** – D.D. Abeysinghe ([e22004@eng.pdn.ac.lk](mailto:e22004@eng.pdn.ac.lk))

---

## Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture)
3. [Software Designs](#software-designs)
4. [Testing](#testing)
5. [Technology Stack](#technology-stack)
6. [Conclusion](#conclusion)
7. [Links](#links)

---

## Introduction

Healthcare facilities still face problems such as paper-based records, scattered patient information, appointment conflicts, and limited access to medical history. These issues can lead to delays in treatment, data loss, and poor patient experience.

The **Patient Management System (PMS)** is a web-based application designed to manage patient records, medical history, appointments, and basic clinical workflows in a centralized system. The goal of this project is to provide a simple, secure, and easy-to-use platform for healthcare staff to access and update patient information efficiently.

This system improves data accuracy, reduces manual work, and supports better decision-making by healthcare providers. In the long term, it can improve patient care quality and operational efficiency.

---

## Solution Architecture

### Architecture Description

#### Frontend (React)
- Provides the user interface for doctors, nurses, reception staff, and administrators
- Handles patient registration, appointment scheduling, and viewing medical records

#### Backend (Spring Boot)
- Acts as the business logic layer
- Handles authentication, authorization, data validation, and API endpoints

#### Database
- Stores patient data, medical records, appointments, billing information, and audit logs

#### Security
- Uses authentication
- Role-based access control
- Encrypted communication (HTTPS)

---

## Software Designs

### 1. System Modules

#### 1.1 Patient Management Module
- Create, update, and search patient records
- Store demographic and emergency contact details
- Handle duplicate patient detection

#### 1.2 Medical Records Module
- Store medical history, allergies, diagnoses, and treatments
- Manage prescriptions and clinical notes
- Attach medical documents and reports

#### 1.3 Appointment Management Module
- Schedule, reschedule, and cancel appointments
- Track appointment history and attendance
- Manage provider availability

#### 1.4 User & Access Control Module
- User login and authentication
- Role-based access (Doctor, Nurse, Admin, Receptionist)
- Audit logs for data access and changes

#### 1.5 Billing & Insurance Module
- Store insurance information
- Generate invoices
- Track payments and billing history

#### 1.6 Reporting Module
- Generate patient summaries
- Administrative and statistical reports
- Export reports in standard formats

---

### 2. Database Design 

#### Key Entities
- Patient
- MedicalRecord
- Appointment
- User
- Role
- Billing
- AuditLog

#### Relationships
- One patient → many appointments
- One patient → many medical records
- One user → one role

> ER diagram will be designed in later phases.

---

### 3. Security Design
- Password encryption
- Role-based authorization
- Secure APIs
- Audit logging
- Compliance with data privacy principles

---

## Testing

### Testing Approach
Since the project is in the early phase, testing focuses on basic functional validation and API-level testing.

### Types of Testing

#### Unit Testing
- Tested backend services and controllers
- Validated input data and business logic

#### Integration Testing
- Tested communication between React frontend and Spring Boot backend
- Verified REST API responses

#### Manual Testing
- Tested patient registration flow
- Tested appointment scheduling
- Verified role-based access behavior

---

## Technology Stack
- **Frontend:** React
- **Backend:** Spring Boot (Java)
- **Database:** PostgreSQL
- **API:** RESTful APIs
- **Security:** JWT, HTTPS

---

## Conclusion

This project defines the foundation of a **Patient Management System** that centralizes patient data, medical records, and appointments using modern web technologies.

At the current stage, system requirements and high-level designs have been clearly identified. The architecture using **React** and **Spring Boot** provides a scalable and maintainable solution.

### Future Enhancements
- Full patient portal access
- Advanced clinical decision support
- Integration with labs and pharmacies
- Mobile application support

---

## Links
- [Project Repository](https://github.com/cepdnaclk/e22-2yp-co2060-Patient-Management-System)
- [Project Page](https://cepdnaclk.github.io/e22-co2060-Patient-Management-System/)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)
