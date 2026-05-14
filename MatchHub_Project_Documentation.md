# MatchHub: Tournament Platform Documentation

## Review 1: Planning

### 1. Project Objectives and Scope
MatchHub is a mobile-first, premium sports tournament registration platform designed to streamline player entries and team management.
*   **Objectives**:
    *   Provide a seamless registration flow for players including photo and payment proof uploads.
    *   Enable tournament organizers to manage registrations, team assignments, and payment approvals.
    *   Ensure production-grade reliability using cloud infrastructure (Vercel, Aiven, Cloudinary).
*   **Scope**: Includes user authentication (PBKDF2), real-time registration status tracking, cloud image hosting, and an admin dashboard for tournament control.

### 2. Research and Literature Review
*   **Authentication Standards**: Researched hashing algorithms and migrated from Bcrypt to PBKDF2 to avoid the 72-byte character limit and ensure cloud compatibility.
*   **Storage Strategies**: Evaluated local vs. cloud storage; implemented Cloudinary to solve the ephemeral filesystem limitations of serverless platforms (Vercel).
*   **Database Reliability**: Researched connection pooling in serverless environments, leading to the implementation of `NullPool` to handle Aiven's connection limits.

### 3. Resources and Tools
*   **Backend**: FastAPI (Python), SQLAlchemy (ORM).
*   **Frontend**: React.js, Vite, Tailwind CSS (Vanilla CSS for custom glassmorphism).
*   **Database**: MySQL (Aiven Cloud).
*   **Storage**: Cloudinary API (Permanent Image Hosting).
*   **Deployment**: Vercel (CI/CD Pipeline).

---

## Review 2: Design & Methodology

### 1. System Architecture
MatchHub follows a **Decoupled Client-Server Architecture**:
*   **Frontend**: A Single Page Application (SPA) that communicates via a RESTful API. It uses React-Query for state management and Framer Motion for premium UI animations.
*   **Backend**: A stateless FastAPI microservice. It handles business logic, security, and bridges the gap between the database and external cloud services.
*   **Storage Layer**: 
    *   **Structured Data**: MySQL handles relations (Players, Teams, Tournaments).
    *   **Unstructured Data**: Cloudinary stores binary assets (Photos, Screenshots).

### 2. Project Workflow
The system utilizes a modern development workflow:
1.  **Registration Workflow**:
    *   Player submits multipart form-data.
    *   Backend validates fields and creates a hashed user account.
    *   Images are streamed directly to Cloudinary.
    *   Database records are created with the secure cloud URLs.
2.  **Deployment Workflow**:
    *   Code pushed to GitHub triggers a Vercel build.
    *   Vercel injects environment variables (DB URLs, Cloudinary Keys).
    *   Database auto-migrations run on startup to ensure schema consistency.
    *   Dynamic Request detection ensures image URLs work across Localhost and Production.
