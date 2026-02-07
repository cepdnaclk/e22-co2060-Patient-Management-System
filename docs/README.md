---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: e22-co2060-project-template
title: Project Template
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# Patient Management System

---

## Team
-  E/22/364, S.M.L.E Senadhipathi, [email](e22364@eng.pdn.ac.lk)
-  E/22/125, D.D.S.K.Gunawardhana, [email](e22125@eng.pdn.ac.lk)
-  E/22/159, G.K.M JAYANGA, [email](e22159@eng.pdn.ac.lk)
-  E/22/004, D.D ABEYSINGHE, [email](e22004@eng.pdn.ac.lk)

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

Healthcare facilities still face problems such as paper-based records, scattered patient information, appointment conflicts, and limited access to medical history. These issues can lead to delays in treatment, data loss, and poor patient experience.

The Patient Management System (PMS) is a web-based application designed to manage patient records, medical history, appointments, and basic clinical workflows in a centralized system. The goal of this project is to provide a simple, secure, and easy-to-use platform for healthcare staff to access and update patient information efficiently.

This system improves data accuracy, reduces manual work, and supports better decision-making by healthcare providers. In the long term, it can improve patient care quality and operational efficiency.


## Solution Architecture

Architecture Description

Frontend (React)
-Provides the user interface for doctors, nurses, reception staff, and administrators.
-Handles patient registration, appointment scheduling, and viewing medical records.

Backend (Spring Boot)
-Acts as the business logic layer.
-Handles authentication, authorization, data validation, and API endpoints.

Database
-Stores patient data, medical records, appointments, billing information, and audit logs.

Security
-Uses authentication, role-based access control, and encrypted communication (HTTPS).

## Software Designs

1. System Modules
1.1 Patient Management Module
  -Create, update, and search patient records
  -Store demographic and emergency contact details
  -Handle duplicate patient detection

1.2 Medical Records Module
  -Store medical history, allergies, diagnoses, and treatments
  -Manage prescriptions and clinical notes
  -Attach medical documents and reports

1.3 Appointment Management Module
  -Schedule, reschedule, and cancel appointments
  -Track appointment history and attendance
  -Manage provider availability

1.4 User & Access Control Module
  -User login and authentication
  -Role-based access (Doctor, Nurse, Admin, Receptionist)
  -Audit logs for data access and changes

1.5 Billing & Insurance Module
  -Store insurance information
  -Generate invoices
  -Track payments and billing history

1.6 Reporting Module
  -Generate patient summaries
  -Administrative and statistical reports
  -Export reports in standard formats
  
2. Database Design (High-Level)

Key entities:
  -Patient
  -MedicalRecord
  -Appointment
  -User
  -Role
  -Billing
  -AuditLog

Relationships:
  -One patient → many appointments
  -One patient → many medical records
  -One user → one role
-(ER diagram will be designed in later phases)

3. Security Design
  -Password encryption
  -Role-based authorization
  -Secure APIs
  -Audit logging
  -Compliance with data privacy principles

## Testing

Testing Approach
Since the project is in the early phase, testing focuses on basic functional validation and API-level testing.

Types of Testing
  -Unit Testing
      --Tested backend services and controllers
      --Validated input data and business logic
  -Integration Testing
      --Tested communication between React frontend and Spring Boot backend
      --Verified REST API responses
  -Manual Testing
    --Tested patient registration flow
    --Tested appointment scheduling
    --Verified role-based access behavior

## Technology Stack.Frontend: React
  -Backend: Spring Boot (Java)
  -Database: PostgreSQL
  -API: RESTful APIs
  -Security: JWT, HTTPS

## Conclusion

This project defines the foundation of a Patient Management System that centralizes patient data, medical records, and appointments using modern web technologies.

At the current stage, system requirements and high-level designs have been clearly identified. The architecture using React and Spring Boot provides a scalable and maintainable solution.

Future Enhancements
  -Full patient portal access
  -Advanced clinical decision support
  -Integration with labs and pharmacies
  -Mobile application support
  


## Links

- [Project Repository](https://github.com/cepdnaclk/e22-2yp-co2060-Patient-Management-System)
- [Project Page](https://cepdnaclk.github.io/e22-2yp-co2060-Patient-Management-System/)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
