# AI StudyBuddy — LearnMate

An AI-powered study assistance platform that helps students turn study materials into useful learning resources such as **summaries, flashcards, quizzes, and personalized study plans**.

The project uses a **React frontend**, **Node.js + Express.js backend**, **MongoDB**, **JWT authentication**, and the **Google Gemini API** for AI-powered content generation.

---

## Features

### 👨‍🎓 Student Features

- Student registration and login
- JWT-based authentication
- Upload and manage study materials
- View individual study materials
- Edit and delete study materials
- Generate AI summaries
- Generate AI flashcards
- Generate AI quizzes
- Generate personalized study plans
- View previously generated AI resources
- Dashboard with resource counts

### 🛡️ Admin Features

- Admin authentication and role-based access
- View registered users
- View individual user details
- View system statistics
- Delete users
- Prevent unauthorized students from accessing admin endpoints

### 🤖 AI Features

The application uses Google Gemini to generate:

- Study summaries
- Flashcards
- Quiz questions
- Study plans

Generated resources are stored in MongoDB and can be retrieved later.

---

## Technology Stack

### Frontend

- React
- React Router
- Axios
- Webpack
- Babel
- HTML/CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- CORS
- dotenv

### AI

- Google Gemini API
- `@google/genai`

---

## Project Architecture

```text
AI StudyBuddy
│
├── index.js
├── package.json
├── .env
│
├── src/
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   └── materialController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Material.js
│   │   ├── Summary.js
│   │   ├── Flashcard.js
│   │   ├── Quiz.js
│   │   └── StudyPlan.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── materials.js
│   │   ├── ai.js
│   │   └── admin.js
│   │
│   └── utils/
│       ├── db.js
│       ├── gemini.js
│       └── jwt.js
│
└── client/
    ├── package.json
    ├── webpack.config.js
    ├── public/
    │   └── index.html
    │
    └── src/
        ├── api.js
        ├── App.js
        ├── index.js
        │
        ├── components/
        │   ├── Navbar.js
        │   └── ProtectedRoute.js
        │
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── DashboardPage.js
            ├── MaterialsPage.js
            ├── MaterialDetailPage.js
            ├── FlashcardsPage.js
            ├── QuizPage.js
            └── StudyPlansPage.js
```

---

## System Architecture

```text
┌──────────────────────┐
│    React Frontend    │
│      Port 3000       │
└──────────┬───────────┘
           │ REST API
           ▼
┌──────────────────────┐
│   Express Backend    │
│      Port 5000       │
└───────┬───────┬──────┘
        │       │
        │       └────────────────┐
        ▼                        ▼
┌───────────────┐       ┌─────────────────┐
│   MongoDB     │       │  Google Gemini  │
│  Database     │       │      API        │
└───────────────┘       └─────────────────┘
```

---

## Database Models

### User

Stores student and administrator accounts.

```text
User
├── name
├── email
├── password
├── role
└── timestamps
```

Roles:

```text
Student
Admin
```

### Material

Stores study material uploaded/provided by students.

```text
Material
├── userId
├── title
├── subject
├── content
└── timestamps
```

### Summary

Stores AI-generated summaries.

```text
Summary
├── userId
├── materialId
├── summary
└── timestamps
```

### Flashcard

Stores generated flashcards.

```text
Flashcard
├── userId
├── materialId
├── question
├── answer
└── timestamps
```

### Quiz

Stores generated quizzes and their questions.

```text
Quiz
├── userId
├── materialId
├── questions
└── timestamps
```

### StudyPlan

Stores personalized study plans.

```text
StudyPlan
├── userId
├── subject
├── studyPlan
├── examDate
├── learningGoal
├── availableHoursPerDay
└── timestamps
```

---

# Getting Started

## Prerequisites

Install the following software:

- Node.js
- npm
- MongoDB
- Git

Check the installations:

```bash
node --version
npm --version
mongosh --version
```

---

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd mohana_projects
```

---

## 2. Install Backend Dependencies

From the project root:

```bash
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

---

## 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/ai_studybuddy

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
```

### Important

Do **not** commit `.env` to Git.

The `.gitignore` file should contain:

```gitignore
.env
.env.*
!.env.example
node_modules/
uploads/
```

You can provide an `.env.example` file for other developers:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai_studybuddy
JWT_SECRET=
GEMINI_API_KEY=
```

---

# Running the Application

## Start MongoDB

Make sure MongoDB is running.

On Ubuntu:

```bash
sudo systemctl start mongod
```

Check its status:

```bash
sudo systemctl status mongod
```

---

## Start the Backend

From the project root:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "AI StudyBuddy API is running"
}
```

---

## Start the Frontend

Open another terminal:

```bash
cd client
npm start
```

The frontend will run on:

```text
http://localhost:3000
```

Open it in your browser:

```text
http://localhost:3000
```

---

# Available API Endpoints

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

Authentication uses JWT tokens.

For protected requests:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Study Materials

### Create / Upload Material

```http
POST /api/material/upload
```

### Get All Materials

```http
GET /api/material
```

### Get Material

```http
GET /api/material/:id
```

### Update Material

```http
PUT /api/material/:id
```

### Delete Material

```http
DELETE /api/material/:id
```

Material operations are restricted to the authenticated user's own materials.

---

# AI Endpoints

All AI endpoints require authentication.

## Summary

Generate a summary:

```http
POST /api/ai/summary/:id
```

Retrieve a summary:

```http
GET /api/ai/summary/:id
```

Retrieve all summaries:

```http
GET /api/ai/summaries
```

---

## Flashcards

Generate flashcards:

```http
POST /api/ai/flashcards/:id
```

Retrieve flashcards for a material:

```http
GET /api/ai/flashcards/:id
```

Retrieve all flashcards:

```http
GET /api/ai/flashcards
```

---

## Quiz

Generate a quiz:

```http
POST /api/ai/quiz/:id
```

Retrieve a quiz:

```http
GET /api/ai/quiz/:id
```

Retrieve all quizzes:

```http
GET /api/ai/quizzes
```

---

## Study Plans

Generate a study plan:

```http
POST /api/ai/study-plan
```

Retrieve study plans:

```http
GET /api/ai/study-plans
```

---

# Admin API

Admin endpoints require both authentication and the `Admin` role.

### Get Users

```http
GET /api/admin/users
```

### Get User

```http
GET /api/admin/users/:id
```

### Delete User

```http
DELETE /api/admin/users/:id
```

### System Statistics

```http
GET /api/admin/stats
```

Students attempting to access admin endpoints receive an authorization error.

---

# Authentication Flow

```text
        ┌──────────────┐
        │    Student   │
        └──────┬───────┘
               │
               ▼
        Register / Login
               │
               ▼
        ┌──────────────┐
        │ JWT Token    │
        └──────┬───────┘
               │
               ▼
        Protected Routes
               │
       ┌───────┴────────┐
       ▼                ▼
   Student APIs      Admin APIs
                         │
                         ▼
                    Admin Role
```

Passwords are hashed using `bcryptjs` and are never stored as plain text.

---

# Student Workflow

```text
Register
   │
   ▼
Login
   │
   ▼
Dashboard
   │
   ▼
Add Study Material
   │
   ▼
Select Material
   │
   ├──► Generate Summary
   │
   ├──► Generate Flashcards
   │
   ├──► Generate Quiz
   │
   └──► Create Study Plan
              │
              ▼
       Store & Retrieve
       Generated Resources
```

---

# AI Generation

The application sends study material and appropriate prompts to the Google Gemini API.

```text
Study Material
      │
      ▼
Express Controller
      │
      ▼
Gemini Utility
      │
      ▼
Google Gemini API
      │
      ▼
Generated Content
      │
      ▼
MongoDB
      │
      ▼
React Frontend
```

> **Note:** AI generation depends on the Gemini API account/project quota. If the configured Gemini API project reaches its quota, AI generation requests may return a quota-related error even though the application and backend are functioning correctly.

---

# Security

The project includes several basic security mechanisms:

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization
- Protected API routes
- User ownership checks for study materials
- Environment variables for secrets
- `.env` excluded from Git
- Admin-only endpoints

---

# Development Commands

### Backend

Start normally:

```bash
npm start
```

Start with automatic restart:

```bash
npm run dev
```

### Frontend

```bash
cd client
npm start
```

Build the frontend:

```bash
npm run build
```

---

# Testing

The application can be tested using:

- Browser
- Postman
- REST API clients

Basic backend health check:

```bash
curl http://localhost:5000/api/health
```

Expected:

```json
{
  "success": true,
  "message": "AI StudyBuddy API is running"
}
```

---

# Project Goals

The main goal of **AI StudyBuddy / LearnMate** is to provide students with a single platform where they can:

1. Manage their study materials.
2. Generate AI-powered summaries.
3. Create flashcards for revision.
4. Generate quizzes for self-assessment.
5. Create personalized study plans.
6. Save and retrieve generated learning resources.

The application follows a modular backend structure so authentication, study materials, AI processing, database operations, and administration remain separated.

---

# Future Enhancements

Possible future improvements include:

- Improved study-material upload support
- More advanced quiz interaction
- Improved study-plan visualization
- Progress tracking
- More detailed analytics
- Improved UI/UX
- Additional AI-generated learning resources

---

# License

This project was developed as a college academic project.

---

## Project Structure Summary

```text
AI StudyBuddy / LearnMate
│
├── React
│      │
│      └── Student/Admin Interface
│
├── Express.js
│      │
│      ├── Authentication
│      ├── Materials
│      ├── AI Resources
│      └── Administration
│
├── MongoDB
│      │
│      ├── Users
│      ├── Materials
│      ├── Summaries
│      ├── Flashcards
│      ├── Quizzes
│      └── Study Plans
│
└── Google Gemini
       │
       ├── Summaries
       ├── Flashcards
       ├── Quizzes
       └── Study Plans
```
