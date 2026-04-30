# Patient Management System - Backend Project Structure & Setup Guide

## 📁 Project File Structure

```
backend/
├── mvnw                              # Maven wrapper (Linux/Mac)
├── mvnw.cmd                          # Maven wrapper (Windows)
├── pom.xml                           # Maven configuration and dependencies
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/pms/backend/
│   │   │       ├── BackendApplication.java         # Spring Boot main application class
│   │   │       ├── appointment/                    # Appointment management module
│   │   │       │   ├── controller/                 # REST endpoints for appointments
│   │   │       │   ├── dto/                        # Data Transfer Objects
│   │   │       │   ├── entity/                     # JPA entities
│   │   │       │   ├── repository/                 # Database access layer
│   │   │       │   └── service/                    # Business logic
│   │   │       ├── auth/                           # Authentication module
│   │   │       │   ├── controller/
│   │   │       │   │   └── AuthController.java     # Login/signup endpoints
│   │   │       │   ├── dto/
│   │   │       │   │   ├── AuthResponse.java
│   │   │       │   │   ├── LoginRequest.java
│   │   │       │   │   └── SignupRequest.java
│   │   │       │   └── service/
│   │   │       │       ├── AuthService.java        # Authentication business logic
│   │   │       │       ├── JwtAuthFilter.java      # JWT authentication filter
│   │   │       │       ├── JwtUtil.java            # JWT token utilities
│   │   │       │       └── SecurityUtil.java       # Security utilities
│   │   │       ├── common/                         # Shared utilities
│   │   │       │   └── exception/                  # Exception handlers
│   │   │       │       ├── AppException.java
│   │   │       │       └── GlobalExceptionHandler.java
│   │   │       ├── config/                         # Application configuration
│   │   │       │   ├── SecurityConfig.java         # Spring Security configuration
│   │   │       │   └── UserDetailsServiceImpl.java  # User authentication provider
│   │   │       ├── doctor/                         # Doctor management module
│   │   │       │   ├── controller/
│   │   │       │   ├── dto/
│   │   │       │   ├── entity/
│   │   │       │   ├── repository/
│   │   │       │   └── service/
│   │   │       ├── medicalrecord/                  # Medical records module
│   │   │       │   ├── controller/
│   │   │       │   ├── dto/
│   │   │       │   ├── entity/
│   │   │       │   ├── repository/
│   │   │       │   └── service/
│   │   │       ├── patient/                        # Patient management module
│   │   │       │   ├── controller/
│   │   │       │   ├── dto/
│   │   │       │   ├── entity/
│   │   │       │   ├── repository/
│   │   │       │   └── service/
│   │   │       ├── role/                           # Role management
│   │   │       │   └── entity/
│   │   │       └── user/                           # User management
│   │   │           ├── dto/
│   │   │           ├── entity/
│   │   │           ├── repository/
│   │   │           └── service/
│   │   └── resources/
│   │       └── application.properties              # Application configuration
│   └── test/
│       └── java/com/pms/backend/
│           └── BackendApplicationTests.java        # Integration tests
└── target/                           # Compiled classes (auto-generated)
    └── classes/
        └── application.properties    # Compiled resource properties
```

## 🏗️ Architecture Overview

This is a **Spring Boot REST API** application following a **layered architecture**:

### Layer Structure:

1. **Controller Layer** - Handles HTTP requests/responses
2. **Service Layer** - Business logic and operations
3. **Repository Layer** - Data access using Spring Data JPA
4. **Entity Layer** - JPA entities representing database tables
5. **DTO Layer** - Data Transfer Objects for API communication

### Key Modules:

| Module            | Purpose                                       |
| ----------------- | --------------------------------------------- |
| **auth**          | JWT-based authentication, login, signup       |
| **user**          | User management and data                      |
| **patient**       | Patient information and management            |
| **doctor**        | Doctor information and management             |
| **appointment**   | Appointment scheduling and management         |
| **medicalrecord** | Patient medical records                       |
| **role**          | User roles (ADMIN, DOCTOR, PATIENT)           |
| **common**        | Shared exceptions and utilities               |
| **config**        | Spring Security and application configuration |

## ⚙️ Prerequisites

Before running the project, ensure you have:

1. **Java Development Kit (JDK)**
   - Version: **Java 25** (specified in pom.xml)
   - Download: https://www.oracle.com/java/technologies/downloads/

2. **PostgreSQL Database**
   - Version: 12+ recommended
   - Download: https://www.postgresql.org/download/

3. **Maven** (optional - project includes Maven Wrapper)
   - Version: 3.6+
   - Download: https://maven.apache.org/download.cgi

4. **Git** (for cloning the repository)

## 🔧 Configuration Setup

### 1. Database Setup

Create PostgreSQL database and user:

```sql
-- Connect to PostgreSQL as admin
CREATE DATABASE pms;
CREATE USER postgres WITH PASSWORD 'root';
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET default_transaction_deferrable TO 'off';
ALTER ROLE postgres SET default_transaction_read_only TO 'off';
ALTER ROLE postgres SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE pms TO postgres;
```

### 2. Environment Variables

Set the JWT secret environment variable:

**Windows (PowerShell):**

```powershell
$env:JWT_SECRET = "your-secret-key-here-make-it-long-and-random"
```

**Windows (Command Prompt):**

```cmd
set JWT_SECRET=your-secret-key-here-make-it-long-and-random
```

**Linux/Mac:**

```bash
export JWT_SECRET="your-secret-key-here-make-it-long-and-random"
```

> **Security Tip:** Use a strong, random secret. Example:
>
> ```
> JWT_SECRET=sXkP9#mL@2qR7$vN!4tB&5xZ*8wY(3)jA=dF-cG+hE^6iO~1uP
> ```

### 3. Application Properties

The `src/main/resources/application.properties` file contains:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/pms
spring.datasource.username=postgres
spring.datasource.password=root

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update  # Auto-create/update tables
spring.jpa.show-sql=true              # Log SQL queries
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
app.jwt.secret=${JWT_SECRET}          # From environment variable
app.jwt.expiration-ms=86400000        # 24 hours in milliseconds

# Server Configuration
server.port=8080
```

## 🚀 How to Run the Application

### Option 1: Using Maven Wrapper (Recommended - No Maven Installation Required)

**Windows:**

```powershell
cd D:\Git_document\e22-co2060-Patient-Management-System\code\backend
./mvnw.cmd spring-boot:run
```

**Linux/Mac:**

```bash
cd path/to/backend
./mvnw spring-boot:run
```

### Option 2: Using Maven (If Installed)

```bash
cd D:\Git_document\e22-co2060-Patient-Management-System\code\backend
mvn spring-boot:run
```

### Option 3: Build JAR and Run

```bash
# Build the project
mvn clean package

# Run the generated JAR
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

## 📋 Build and Compile

### Clean Build:

```bash
mvn clean
```

### Compile Only (without running):

```bash
mvn compile
```

### Run Tests:

```bash
mvn test
```

### Full Build with Tests:

```bash
mvn clean package
```

## ✅ Verify Application is Running

Once the application starts, you should see:

```
Started BackendApplication in X.XXX seconds
```

The application will be accessible at:

```
http://localhost:8080
```

## 📡 API Endpoints

### Authentication:

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login (returns JWT token)

### Example Request (Login):

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"password123"}'
```

### Using JWT Token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/patients
```

## 🐛 Troubleshooting

### Issue: "Connection refused" to PostgreSQL

**Solution:**

- Ensure PostgreSQL is running
- Check database credentials in `application.properties`
- Verify PostgreSQL is listening on port 5432

### Issue: "JWT_SECRET not set"

**Solution:**

- Set the environment variable before running
- Restart your terminal/IDE after setting the environment variable

### Issue: "Java version not supported"

**Solution:**

- Project requires Java 25
- Download and install Java 25 from Oracle

### Issue: Maven build fails

**Solution:**

```bash
mvn clean install -U  # Clear cache and update dependencies
```

## 📚 Key Dependencies

| Dependency         | Purpose                         |
| ------------------ | ------------------------------- |
| Spring Boot 4.0.3  | Framework foundation            |
| Spring Security    | Authentication & Authorization  |
| Spring Data JPA    | Database ORM                    |
| PostgreSQL Driver  | Database connectivity           |
| JJWT 0.12.6        | JWT token generation/validation |
| Lombok             | Reduce boilerplate code         |
| Validation Starter | Input validation                |

## 🔐 Security Features

- **JWT Authentication** - Token-based stateless authentication
- **Spring Security** - Request filtering and authorization
- **Password Encryption** - Passwords hashed before storage
- **Role-Based Access Control** - ADMIN, DOCTOR, PATIENT roles

## 📝 Development Notes

### Adding a New Module:

1. Create a new folder under `com.pms.backend`
2. Follow the pattern: `controller/`, `service/`, `repository/`, `entity/`, `dto/`
3. Create appropriate classes in each package
4. Register routes in controller with `@RestController` and `@RequestMapping`

### Database Changes:

- `spring.jpa.hibernate.ddl-auto=update` automatically syncs schema
- For production, use `validate` instead

### Common Annotations Used:

- `@Entity` - JPA entity mapping to database table
- `@RestController` - REST API endpoint
- `@Service` - Business logic
- `@Repository` - Data access
- `@Autowired` - Dependency injection
- `@RequestMapping` - URL path mapping

## 🎯 Next Steps

1. Set up database and environment variables
2. Run the application using Maven
3. Test API endpoints with Postman or cURL
4. Review authentication flow in `auth/` module
5. Explore business logic in service layers

---

**Last Updated:** March 3, 2026
**Project:** Patient Management System - Backend
**Framework:** Spring Boot 4.0.3
**Language:** Java 25
**Database:** PostgreSQL
