# SpringPro - Educational Authentication Platform

A modern, secure web application providing JWT-based authentication and role-based access control for educational institutions. Built with Spring Boot and React.

[![Java](https://img.shields.io/badge/Java-17-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with BCrypt password hashing
- **Role-Based Access Control**: Three user roles (Student, Instructor, Admin) with granular permissions
- **User Management**: Complete CRUD operations for user accounts
- **Student Management**: Manage student records and information
- **Password Reset**: Secure password reset flow with email tokens
- **Activity Logging**: Track user actions for security and analytics
- **Admin Dashboard**: System analytics and user management interface
- **Premium UI**: Modern, responsive design with glassmorphism effects
- **RESTful API**: Well-documented REST API with comprehensive error  handling

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/springpro.git
cd springpro

# Set up database
mysql -u root -p
CREATE DATABASE springpro_db;

# Configure application
# Edit src/main/resources/application.properties with your database credentials

# Install frontend dependencies
cd frontend
npm install

# Run both backend and frontend with one command
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📦 Prerequisites

- **Java**: JDK 17 or higher
- **Maven**: 3.6+ (for building the backend)
- **Node.js**: 18+ (for the frontend)
- **MySQL**: 8.0+ (database)
- **Git**: For version control

## 🔧 Installation

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/springpro.git
   cd springpro
   ```

2. **Create MySQL database**:
   ```sql
   CREATE DATABASE springpro_db;
   ```

3. **Configure database connection**:
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/springpro_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. **Build the project**:
   ```bash
   mvn clean install
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed):
   Create `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

## ⚙️ Configuration

### Application Properties

Key configuration options in `application.properties`:

```properties
# Application name
spring.application.name=springpro

# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/springpro_db
spring.datasource.username=root
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration (add these)
jwt.secret=your-secret-key-here-make-it-long-and-secure
jwt.expiration=86400000

# Email Configuration (for password reset)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### Environment Variables

For production, use environment variables:

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/springpro_db
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your-secret-key
```

## 🏃 Running the Application

### Development Mode (Recommended - Both Servers at Once)

**Run both frontend and backend with a single command**:
```bash
cd frontend
npm run dev
```
This will automatically start:
- Backend on `http://localhost:8080`
- Frontend on `http://localhost:5173`

### Development Mode (Separate Terminals)

If you prefer to run servers separately:

**Backend** (Terminal 1):
```bash
mvn spring-boot:run
```
Backend will run on `http://localhost:8080`

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev:frontend
```
Frontend will run on `http://localhost:5173`

### Production Build

**Backend**:
```bash
mvn clean package
java -jar target/springpro-0.0.1-SNAPSHOT.jar
```

**Frontend**:
```bash
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

Complete API documentation is available in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

### Quick API Reference

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/authenticate` - Login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users` - List users (Admin)
- `DELETE /api/users/{id}` - Delete user (Admin)

#### Students
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

#### Analytics (Admin)
- `GET /api/analytics/summary` - Dashboard metrics
- `GET /api/analytics/user-activity` - Activity logs

### Example API Call

```bash
# Register a new user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:8080/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

## 📁 Project Structure

```
springpro/
├── src/
│   ├── main/
│   │   ├── java/com/springpro/
│   │   │   ├── config/           # Security, JWT, Application config
│   │   │   ├── controller/       # REST API controllers
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── entity/           # JPA entities
│   │   │   ├── repository/       # Data access layer
│   │   │   ├── service/          # Business logic
│   │   │   └── SpringproApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/                     # Unit and integration tests
├── frontend/
│   ├── src/
│   │   ├── pages/                # React page components
│   │   ├── services/             # API service layer
│   │   ├── App.jsx               # Main app component
│   │   ├── index.css             # Global styles
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docs/                         # Documentation
│   ├── PROJECT_SPEC.md           # Complete project specification
│   ├── API_DOCUMENTATION.md      # API reference
│   └── DATABASE_SCHEMA.md        # Database schema
├── pom.xml                       # Maven configuration
└── README.md
```

## 🧪 Testing

### Backend Tests

Run all tests:
```bash
mvn test
```

Run specific test class:
```bash
mvn test -Dtest=AuthControllerTest
```

Generate coverage report:
```bash
mvn jacoco:report
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🚢 Deployment

### Docker Deployment

**Build Docker image**:
```bash
docker build -t springpro:latest .
```

**Run with Docker Compose**:
```bash
docker-compose up -d
```

### Cloud Deployment

See [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) section 12 for detailed deployment instructions for:
- AWS (EC2, RDS, S3)
- Google Cloud Platform
- Heroku
- Render

## 🔐 Security

- **Password Hashing**: BCrypt with strength 10
- **JWT Tokens**: Secure token-based authentication
- **CORS**: Configured for frontend origin
- **SQL Injection**: Protected via JPA parameterized queries
- **XSS Protection**: Input sanitization and Content-Security-Policy headers
- **Rate Limiting**: 100 requests/minute per IP
- **Account Lockout**: After 5 failed login attempts

## 📖 Documentation

- **[Project Specification](docs/PROJECT_SPEC.md)**: Complete 15-section product specification
- **[API Documentation](docs/API_DOCUMENTATION.md)**: Detailed API reference
- **[Database Schema](docs/DATABASE_SCHEMA.md)**: Database design and ERD

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the frontend library
- All contributors who help improve this project

## 📞 Support

For support, email support@springpro.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

See [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) section 13 for the complete roadmap.

**Current Status**: M1 (MVP) ✅

**Next Milestones**:
- M2: Enhanced Security & UX (password reset, email notifications)
- M3: Admin Features & Analytics
- M4: Testing & Quality
- M5: DevOps & Production
- M6: Advanced Features (OAuth2, 2FA, mobile app)

---

**Built with ❤️ using Spring Boot and React**
