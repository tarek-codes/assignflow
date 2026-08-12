# Assignment Management System Database Schema

## Overview

This schema supports:

-   Unified users (Admin, Teacher, Student)
-   One teacher per class-subject combination
-   Multiple class enrollments per student
-   Assignments and submissions
-   Application settings

## ER Relationships

``` text
Users (1)
├── Admins
├── Teachers ──< Classes >── Subjects
└── Students ──< Student_Classes >── Classes

Classes ──< Assignments ──< Submissions >── Students

Admins ──< App_Settings
```

## PostgreSQL Schema

``` sql
-- ENUMS

CREATE TYPE user_role AS ENUM ('ADMIN','TEACHER','STUDENT');

CREATE TYPE assignment_status AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'CLOSED'
);

CREATE TYPE submission_status AS ENUM (
    'NOT_SUBMITTED',
    'SUBMITTED',
    'LATE',
    'UNDER_REVIEW',
    'GRADED'
);

-- USERS

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(30),
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMINS

CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

-- TEACHERS

CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    designation VARCHAR(100)
);

-- SUBJECTS

CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) UNIQUE NOT NULL,
    subject_code VARCHAR(20) UNIQUE,
    description TEXT
);

-- CLASSES

CREATE TABLE classes (
    class_id SERIAL PRIMARY KEY,
    class_level INTEGER NOT NULL,
    subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE RESTRICT,
    teacher_id INTEGER NOT NULL REFERENCES teachers(teacher_id) ON DELETE RESTRICT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_level, subject_id)
);

-- STUDENTS

CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    student_number VARCHAR(50) UNIQUE NOT NULL
);

-- STUDENT ENROLLMENTS

CREATE TABLE student_classes (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, class_id)
);

-- ASSIGNMENTS

CREATE TABLE assignments (
    assignment_id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    deadline TIMESTAMP NOT NULL,
    max_marks INTEGER NOT NULL,
    status assignment_status DEFAULT 'DRAFT',
    allow_resubmission BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SUBMISSIONS

CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    submitted_at TIMESTAMP,
    marks NUMERIC(5,2),
    feedback TEXT,
    status submission_status DEFAULT 'NOT_SUBMITTED',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (assignment_id, student_id)
);

-- APP SETTINGS

CREATE TABLE app_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES admins(admin_id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES

CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_subject ON classes(subject_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_student_classes_student ON student_classes(student_id);
CREATE INDEX idx_student_classes_class ON student_classes(class_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
```
