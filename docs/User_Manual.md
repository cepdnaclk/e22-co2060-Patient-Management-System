# Patient Management System — User Manual

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Signing Up & Logging In](#3-signing-up--logging-in)
4. [Understanding User Roles](#4-understanding-user-roles)
5. [Patient Dashboard](#5-patient-dashboard)
6. [Doctor Dashboard](#6-doctor-dashboard)
7. [Nurse Dashboard](#7-nurse-dashboard)
8. [Receptionist Dashboard](#8-receptionist-dashboard)
9. [Pharmacist Dashboard](#9-pharmacist-dashboard)
10. [Lab Technician Dashboard](#10-lab-technician-dashboard)
11. [Billing Staff Dashboard](#11-billing-staff-dashboard)
12. [Admin Dashboard](#12-admin-dashboard)
13. [Management Dashboard](#13-management-dashboard)
14. [Notifications](#14-notifications)
15. [Frequently Asked Questions (FAQ)](#15-frequently-asked-questions-faq)
16. [Troubleshooting](#16-troubleshooting)
17. [Contact & Support](#17-contact--support)

---

## 1. Introduction

The **Patient Management System (PMS)** is a web-based application designed to streamline healthcare operations by centralizing patient records, appointment scheduling, medical history, prescriptions, lab results, and billing into a single, easy-to-use platform.

### Key Benefits

- **Centralized Records** — All patient data in one place, accessible to authorized staff.
- **Role-Based Access** — Each user sees only the features and data relevant to their role.
- **Real-Time Notifications** — Instant updates via WebSocket-powered notifications.
- **Google Sign-In** — Quick and secure login with your Google account.
- **Secure & Compliant** — JWT authentication, encrypted passwords, and audit logging.

---

## 2. Getting Started

### System Requirements

| Requirement | Details |
|---|---|
| **Browser** | Google Chrome (v100+), Firefox (v100+), Microsoft Edge (v100+), Safari (v15+) |
| **Internet** | Stable internet connection |
| **Screen** | Minimum 1024 × 768 resolution (responsive design supports mobile) |

### Accessing the Application

1. Open your web browser.
2. Navigate to the application URL provided by your administrator (e.g., `https://e22-co2060-patient-management-syste-three.vercel.app`).
3. You will be presented with the **Home Page** featuring an overview of the system.

---

## 3. Signing Up & Logging In

### Creating a New Account

1. Click **"Sign Up"** from the navigation bar or home page.
2. Fill in the required fields:
   - **First Name** and **Last Name**
   - **Email Address** (must be unique)
   - **Mobile Number**
   - **Password** (must meet security requirements)
   - **Role** — Select your role (e.g., Patient, Doctor, Nurse, etc.)
3. Alternatively, click **"Sign in with Google"** to use your Google account.
4. Click **"Sign Up"** to create your account.

> **Note:** Some roles (e.g., Doctor, Nurse, Admin) may require administrator approval before access is granted.

### Logging In

1. Click **"Login"** from the navigation bar.
2. Enter your **Email** and **Password**.
3. Alternatively, use **"Sign in with Google"** for one-click login.
4. Upon successful login, you will be automatically redirected to your role-specific dashboard.

### Session Management

- Your session is secured with **JWT tokens** that expire after **15 minutes**.
- The system automatically refreshes your session using a **refresh token** (valid for 7 days).
- If your session expires completely, you will be redirected to the login page.

### Logging Out

- Click the **Logout** button in the navigation bar or sidebar.
- This invalidates your session on both the browser and the server.

---

## 4. Understanding User Roles

The PMS uses **role-based access control (RBAC)**. Each role has access to specific features:

| Role | Key Permissions |
|---|---|
| **Patient** | View own medical records, appointments, prescriptions, lab results, and itemized billing/invoices |
| **Doctor** | Full clinical access — diagnoses, prescriptions, medical records, appointments |
| **Nurse** | Record vitals, assist doctors, view patient information |
| **Receptionist** | Book/manage appointments, register patients, queue consultation fees, front-desk invoicing & payments |
| **Pharmacist** | View and manage prescriptions, dispense medications, auto-queue medication charges to billing |
| **Lab Technician** | Enter and manage lab test results, upload reports, auto-queue lab diagnostic fees to billing |
| **Billing Staff** | Centralized billing hub — process pending department charges, issue consolidated invoices, record payments, revenue analytics |
| **Admin** | Manage users, view audit logs, system reports |
| **Super Admin** | Full system access, manage all users and configurations |
| **Management** | User & staff management, administrative reporting |

---

## 5. Patient Dashboard

After logging in as a **Patient**, you will see your personalized dashboard with the following sections:

### 5.1 Overview

- Summary cards showing upcoming appointments, recent prescriptions, and pending lab results.

### 5.2 My Appointments

- **View** all your scheduled, completed, and cancelled appointments.
- **Book New Appointment** — Select a doctor, choose a date/time, and provide the reason for visit.
- **Cancel Appointment** — Cancel an upcoming appointment if needed.

### 5.3 Medical Records

- View your complete medical history including:
  - **Diagnoses** — Past and current conditions
  - **Prescriptions** — Medications prescribed by your doctors
  - **Lab Results** — Test results and reports
  - **Clinical Notes** — Notes from your healthcare providers

### 5.4 Profile Management
- View and update your personal information:
  - Contact details
  - Emergency contact information
  - Medical history and allergies

### 5.5 Billing & Invoices
- **View Invoices** — Access past and current invoices issued by the healthcare facility.
- **Itemized Charge Breakdown** — Review specific line items categorized by department:
  - Pharmacy charges (prescribed medications, dosage quantities, unit prices)
  - Laboratory charges (tests conducted, diagnostic panel fees)
  - Consultation and clinical procedure fees
- **Payment Status Tracking** — Check invoice payment status (`ISSUED`, `PARTIALLY_PAID`, `PAID`).
- **View Payment History & Receipts** — Inspect payment amounts, dates, payment methods, and remaining balance.

---

## 6. Doctor Dashboard

The **Doctor Dashboard** provides full clinical tools:

### 6.1 Overview

- Summary of today's appointments, pending reviews, and patient queue.

### 6.2 Appointments

- View daily/weekly schedule of patient appointments.
- Mark appointments as **Completed** or **No-Show**.
- Add clinical notes during or after appointments.

### 6.3 Patient Records

- Search and view patient profiles and medical history.
- **Create Medical Records** — Add new diagnoses, prescriptions, lab orders, and clinical notes.
- **Update Records** — Modify existing medical records.
- Record types supported:
  - `DIAGNOSIS` — Medical conditions and findings
  - `PRESCRIPTION` — Medications and dosage instructions
  - `LAB_RESULT` — Laboratory test orders and results
  - `IMAGING` — Radiology and imaging reports

### 6.4 Prescriptions

- Write new prescriptions with medication details, dosage, and duration.
- View prescription history for any patient.

---

## 7. Nurse Dashboard

The **Nurse Dashboard** assists nurses in clinical support tasks:

### 7.1 Patient Vitals

- Record patient vital signs (blood pressure, temperature, pulse, etc.).
- View patient queues for the day.

### 7.2 Appointment Assistance

- View upcoming appointments assigned to doctors.
- Help prepare patient information before consultations.

### 7.3 Patient Information

- Access patient profiles and relevant medical history for care coordination.

---

## 8. Receptionist Dashboard

The **Receptionist Dashboard** focuses on front-desk operations:

### 8.1 Patient Registration

- Register new patients entering the facility.
- Search for existing patient records.

### 8.2 Appointment Management

- **Schedule** new appointments for patients with available doctors.
- **Reschedule** or **Cancel** existing appointments.
- View doctor availability and schedules.

### 8.3 Patient Queue
- Manage the daily patient check-in and waiting queue.

### 8.4 Front-Desk Billing & Consultation Charges
- **Queue Consultation Charges** — Dispatch consultation fees directly to the patient's pending bill queue.
- **Direct Invoice Generation** — Issue consolidated invoices for walk-in visits or appointment check-outs.
- **Process Payments** — Accept payments at the front desk via Cash, Card, or Insurance.

---

## 9. Pharmacist Dashboard

The **Pharmacist Dashboard** manages prescription workflows:

### 9.1 Prescriptions Queue
- View incoming prescriptions from doctors.
- Mark prescriptions as **Dispensed** or **Pending**.
- **Automated Billing Staging** — When medications are dispensed, itemized medication costs (unit price × quantity) are automatically dispatched to the billing system's pending bill queue (`pending_bill_items`), eliminating manual reentry.

### 9.2 Medication Management
- Search medication inventory and pricing.
- Track dispensing history.

---

## 10. Lab Technician Dashboard

The **Lab Technician Dashboard** handles laboratory operations:

### 10.1 Lab Orders
- View pending lab test orders from doctors.
- Update test status (Pending → In Progress → Completed).

### 10.2 Results Entry & Automated Charge Dispatch
- Enter lab test results and attach reports.
- Upload lab report files (PDF, images up to 10 MB).
- **Automated Billing Staging** — Completing a lab order automatically forwards the corresponding diagnostic test charges to the patient's pending billing queue.

### 10.3 Report Management
- View and manage completed lab reports.
- Reports are accessible to the ordering doctor and the patient.

---

## 11. Billing Staff Dashboard

The **Billing Staff Dashboard** serves as the central financial hub of the hospital, integrating service charges across all clinical departments into consolidated invoices and managing revenue lifecycle.

### 11.1 Centralized Billing Workflow Overview
The system follows a staging-and-consolidation billing architecture:
1. **Service Delivery**: As patients visit the clinic, receive prescriptions from the Pharmacy, or undergo tests in the Laboratory, each department dispatches line items into the central **Pending Bill Items** staging queue.
2. **Pending Queue Monitoring**: Billing staff review patients who have unbilled charges accumulated from one or more departments.
3. **Consolidated Invoicing**: Staff combine pending departmental charges, add optional custom items, apply discounts or tax, and generate a finalized Invoice. Staged items automatically transition from `PENDING` to `BILLED`.
4. **Payment Collection**: Staff record payments (full or partial) against issued invoices and issue receipts.

### 11.2 Process Pending Bills Panel
Accessible via the **"Process Pending Bills"** sidebar menu:
- **Patients with Pending Bills**: Displays a real-time list of all patients who have unbilled charges awaiting processing.
- **Departmental Item Review**: Selecting a patient displays all staged items grouped by origin:
  - `PHARMACY` — Medications, dosage quantities, unit prices, and line totals.
  - `LAB` — Diagnostic investigations, lab panels, and specimen processing fees.
  - `RECEPTION` / `CLINICAL` — Doctor consultation charges, specialist fees, or registration costs.
- **Add Additional Line Items**: Staff can add manual charges on the fly (e.g., room charges, medical consumables, emergency care supplements) specifying description, quantity, and unit price.
- **Adjustments & Calculations**:
  - Automatically calculates subtotal from pending items and additional entries.
  - **Discount**: Apply flat discount amounts where applicable (e.g., institutional concessions).
  - **Tax**: Add applicable government/hospital taxes.
  - **Clinical Notes**: Add internal or invoice-facing notes (e.g., insurance claim numbers, payment terms).
- **Generate Invoice**: Clicking **"Generate Invoice"** creates the official invoice with a unique tracking number (e.g., `INV-2026-01042`), sets the initial status to `ISSUED`, and marks all staged items as `BILLED`.

### 11.3 Invoice Management & Invoices List
Accessible via the **"Billing & Invoices"** sidebar menu:
- **Search & Filter**: Search invoices by invoice number, patient name, or patient ID. Filter invoices by status:
  - `ISSUED` — Invoice generated, awaiting payment.
  - `PARTIALLY_PAID` — Partial installment received, balance remaining.
  - `PAID` — Fully settled.
  - `CANCELLED` — Voided invoice.
- **Invoice Details & Breakdown**: Inspect line-item charges, tax, discounts, timestamps, creating staff member, and customer payment history.
- **Print / Download**: Generate printable invoice slips and receipts for patients.

### 11.4 Payment Processing
- **Record Payment**: Click **"Pay"** on any unpaid or partially paid invoice.
- **Payment Amounts**: Accept full payments or partial installments. The system automatically computes the remaining balance:
  - If payment settles the full total, status transitions to `PAID`.
  - If payment is partial, status updates to `PARTIALLY_PAID`.
- **Supported Payment Methods**:
  - **Cash**
  - **Credit / Debit Card**
  - **Insurance / Third-Party Payer**
  - **Bank Transfer / Online**
- **Audit Logging**: Every invoice created and payment recorded is automatically captured in the immutable audit log for financial compliance.

### 11.5 Revenue Summary & Financial Metrics
Top-level metrics give billing administrators instant visibility into hospital revenue:
- **Total Revenue Collected** — Cumulative monetary value of all processed payments (`PAID` and `PARTIALLY_PAID`).
- **Completed Invoices** — Total count of fully paid customer invoices.
- **Pending Receivables** — Real-time tracking of outstanding hospital balances.

---

## 12. Admin Dashboard

The **Admin Dashboard** provides system administration tools:

### 12.1 User Management

- View all registered users.
- **Activate/Deactivate** user accounts.
- **Change user roles** as needed.
- Delete user accounts.

### 12.2 Audit Logs

- View a comprehensive log of all system activities including:
  - User logins and logouts
  - Record access and modifications
  - Administrative actions

### 12.3 System Reports

- Generate administrative and statistical reports.

---

## 13. Management Dashboard

The **Management Dashboard** focuses on organizational oversight:

### 13.1 Staff Management

- View and manage staff accounts (excludes Admin-level accounts).
- Monitor staff activity and workload.

### 13.2 Operational Reports

- Access reports on appointment volumes, patient demographics, and staff utilization.

---

## 14. Notifications

The PMS features a **real-time notification system** powered by WebSocket technology:

- **Bell Icon** — A notification bell in the navigation bar shows unread notification count.
- Click the bell icon to view recent notifications.
- Notification types include:
  - New appointment bookings
  - Appointment cancellations
  - Lab results availability
  - Prescription updates
  - System announcements

---

## 15. Frequently Asked Questions (FAQ)

**Q: I forgot my password. What do I do?**
> Contact your system administrator to reset your password.

**Q: Why can't I access certain features?**
> The system uses role-based access control. You can only access features assigned to your role. Contact your administrator if you need additional permissions.

**Q: My session keeps expiring. Is this normal?**
> Yes. For security, sessions expire after 15 minutes of inactivity. The system automatically refreshes your session while you are actively using it.

**Q: Can I use the system on my phone?**
> Yes. The PMS is built with responsive design and works on mobile browsers, tablets, and desktops.

**Q: How is my data protected?**
> The system uses JWT authentication, encrypted passwords (BCrypt), HTTPS encryption, role-based access, and audit logging to protect your data.

---

## 16. Troubleshooting

| Problem | Solution |
|---|---|
| Cannot log in | Verify your email and password. Check if your account is active. Your account may be locked after 5 failed attempts (lockout lasts 15 minutes). |
| Page not loading | Clear your browser cache (Ctrl+Shift+Delete). Try a different browser. Check your internet connection. |
| "Access Denied" error | You do not have permission for this page. Verify you are logged in with the correct role. |
| Notifications not updating | Refresh the page. Ensure your browser allows WebSocket connections. |
| File upload fails | Ensure the file is under 10 MB. Supported formats: PDF, JPEG, PNG. |
| Seeing outdated data | Refresh the page (F5). If the issue persists, log out and log back in. |

---

## 17. Contact & Support

For technical support or questions, contact the development team:

| Team Member | Email |
|---|---|
| S.M.L.E Senadhipathi (E/22/364) | [e22364@eng.pdn.ac.lk](mailto:e22364@eng.pdn.ac.lk) |
| D.D.S.K. Gunawardhana (E/22/125) | [e22125@eng.pdn.ac.lk](mailto:e22125@eng.pdn.ac.lk) |
| G.K.M. Jayanga (E/22/159) | [e22159@eng.pdn.ac.lk](mailto:e22159@eng.pdn.ac.lk) |
| D.D. Abeysinghe (E/22/004) | [e22004@eng.pdn.ac.lk](mailto:e22004@eng.pdn.ac.lk) |

**Project Links:**
- [GitHub Repository](https://github.com/cepdnaclk/e22-2yp-co2060-Patient-Management-System)
- [Project Page](https://cepdnaclk.github.io/e22-co2060-Patient-Management-System/)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

---

*Patient Management System — User Manual*
*Department of Computer Engineering, University of Peradeniya*
*Last Updated: September 2026*
