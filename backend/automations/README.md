# Automations Dashboard — Backend

REST API for managing automation workflows. Built with **Spring Boot**, **PostgreSQL (Supabase)**, and deployed on **Railway**.

This is the backend piece of a full-stack portfolio project that demonstrates clean architecture, layered design, and good Spring Boot practices.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 4 |
| Language | Java 21 |
| Database | PostgreSQL (Supabase) |
| ORM | Spring Data JPA / Hibernate |
| Security | Spring Security (JWT — in progress) |
| Validation | Jakarta Bean Validation |
| Build | Maven |
| Deploy | Railway |

---

## Project Structure

```
src/main/java/com/dashboard/automations/
├── config/         # Security and app configuration
├── controller/     # REST controllers
├── dto/            # Request and response DTOs
├── exception/      # Custom exceptions and global handler
├── model/          # JPA entities and enums
├── repository/     # Spring Data JPA repositories
└── service/        # Business logic
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/automations` | List all automations |
| GET | `/api/automations/{id}` | Get automation by ID |
| POST | `/api/automations` | Create automation |
| PUT | `/api/automations/{id}` | Update automation |
| PATCH | `/api/automations/{id}/status?status=ACTIVE` | Update status |
| DELETE | `/api/automations/{id}` | Delete automation |

### Automation statuses
`ACTIVE` · `INACTIVE` · `RUNNING`

---

## Running Locally

**Prerequisites:** Java 21, Maven, a PostgreSQL database (or Supabase project)

1. Clone the repo and navigate to the project folder:
   ```bash
   cd backend/automations
   ```

2. Set the required environment variables:
   ```bash
   export DB_URL=jdbc:postgresql://<host>:<port>/<database>
   export DB_USERNAME=<username>
   export DB_PASSWORD=<password>
   ```

3. Run:
   ```bash
   ./mvnw spring-boot:run
   ```

The API will be available at `http://localhost:8080`.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_URL` | JDBC connection string for PostgreSQL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `PORT` | Server port (default: `8080`) |

---

## Roadmap

- [x] Automation CRUD
- [x] Global exception handling
- [x] Input validation
- [ ] JWT authentication
- [ ] User management
- [ ] Pagination and filtering
- [ ] Trigger execution engine
