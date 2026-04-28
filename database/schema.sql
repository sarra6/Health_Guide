-- ============================================================
-- HealthGuide AI — MySQL Database Schema
-- Used by Sequelize ORM (tables auto-created via sync)
-- Run this manually if you prefer to create tables yourself
-- ============================================================

CREATE DATABASE IF NOT EXISTS health_guide;
USE health_guide;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    role            ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    dateOfBirth     DATE,
    gender          ENUM('male', 'female', 'other'),
    medicalLicense  VARCHAR(100),
    isVerified      TINYINT(1) DEFAULT 0,
    profilePicture  VARCHAR(500),
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- HEALTH DATA TABLE
CREATE TABLE IF NOT EXISTS health_data (
    id                      CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId                  CHAR(36) NOT NULL,
    date                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bloodPressureSystolic   INT,
    bloodPressureDiastolic  INT,
    heartRate               INT,
    temperature             DECIMAL(4,1),
    oxygenSaturation        DECIMAL(4,1),
    weight                  DECIMAL(5,1),
    height                  DECIMAL(5,1),
    bmi                     DECIMAL(4,1),
    glucose                 DECIMAL(6,1),
    cholesterol             DECIMAL(6,1),
    hemoglobin              DECIMAL(4,1),
    whiteBloodCells         DECIMAL(6,2),
    symptoms                JSON,
    medications             JSON,
    notes                   TEXT,
    riskLevel               ENUM('low', 'moderate', 'high', 'critical') DEFAULT 'low',
    createdAt               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- CHAT HISTORY TABLE
CREATE TABLE IF NOT EXISTS chat_history (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId      CHAR(36) NOT NULL,
    sessionId   VARCHAR(50) UNIQUE NOT NULL,
    title       VARCHAR(200) DEFAULT 'Health Consultation',
    messages    JSON,
    category    ENUM('symptom-check', 'medication', 'general', 'emergency', 'follow-up') DEFAULT 'general',
    resolved    TINYINT(1) DEFAULT 0,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- AI REPORTS TABLE
CREATE TABLE IF NOT EXISTS ai_reports (
    id                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId              CHAR(36) NOT NULL,
    inputType           ENUM('chat', 'image', 'vitals', 'symptoms') NOT NULL,
    inputData           JSON,
    prediction          TEXT,
    confidenceScore     DECIMAL(5,2),
    recommendation      TEXT,
    riskLevel           ENUM('low', 'moderate', 'high', 'critical'),
    specialistReferral  VARCHAR(100),
    followUpRequired    TINYINT(1) DEFAULT 0,
    reviewedByDoctor    TINYINT(1) DEFAULT 0,
    doctorId            CHAR(36),
    doctorNotes         TEXT,
    disclaimer          TEXT,
    createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE SET NULL
);

-- HEALTH PROFILES TABLE
CREATE TABLE IF NOT EXISTS health_profiles (
    id                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId              CHAR(36) NOT NULL UNIQUE,
    bloodType           ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown') DEFAULT 'Unknown',
    height              DECIMAL(5,1),
    weight              DECIMAL(5,1),
    allergies           JSON DEFAULT ('[]'),
    chronicConditions   JSON DEFAULT ('[]'),
    familyHistory       JSON DEFAULT ('[]'),
    smokingStatus       ENUM('never','former','current') DEFAULT 'never',
    alcoholUse          ENUM('none','occasional','moderate','heavy') DEFAULT 'none',
    exerciseFrequency   ENUM('none','1-2/week','3-4/week','5+/week') DEFAULT 'none',
    emergencyContact    VARCHAR(200),
    emergencyPhone       VARCHAR(30),
    insuranceProvider   VARCHAR(100),
    notes               TEXT,
    createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId          CHAR(36) NOT NULL,
    doctorId        CHAR(36),
    doctorName      VARCHAR(200) NOT NULL,
    specialty       VARCHAR(100),
    date            TIMESTAMP NOT NULL,
    location        VARCHAR(300),
    notes           TEXT,
    status          ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
    reminderSent    TINYINT(1) DEFAULT 0,
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE SET NULL
);

-- MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS medications (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    userId      CHAR(36) NOT NULL,
    name        VARCHAR(200) NOT NULL,
    dosage      VARCHAR(100),
    frequency   VARCHAR(100),
    startDate   DATE,
    endDate     DATE,
    notes       TEXT,
    active      TINYINT(1) DEFAULT 1,
    takenToday  TINYINT(1) DEFAULT 0,
    lastTaken   TIMESTAMP,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patientId       CHAR(36) NOT NULL,
    doctorId        CHAR(36) NOT NULL,
    medicationName  VARCHAR(200) NOT NULL,
    dosage          VARCHAR(100),
    frequency       VARCHAR(100),
    duration        VARCHAR(50),
    instructions    TEXT,
    startDate       DATE,
    endDate         DATE,
    notes           TEXT,
    status          ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    isActive        TINYINT(1) DEFAULT 1,
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctorId) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX idx_health_data_user     ON health_data(userId);
CREATE INDEX idx_health_data_date     ON health_data(date DESC);
CREATE INDEX idx_chat_history_user    ON chat_history(userId);
CREATE INDEX idx_ai_reports_user      ON ai_reports(userId);
CREATE INDEX idx_ai_reports_risk      ON ai_reports(riskLevel);
CREATE INDEX idx_ai_reports_reviewed  ON ai_reports(reviewedByDoctor);
CREATE INDEX idx_appointments_user    ON appointments(userId);
CREATE INDEX idx_appointments_doctor  ON appointments(doctorId);
CREATE INDEX idx_appointments_date    ON appointments(date);
CREATE INDEX idx_medications_user     ON medications(userId);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patientId);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctorId);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- DOCTOR VIEW: pending unreviewed reports
CREATE OR REPLACE VIEW doctor_pending_reports AS
SELECT
    r.id            AS report_id,
    r.inputType,
    r.prediction,
    r.riskLevel,
    r.recommendation,
    r.createdAt,
    u.name          AS patient_name,
    u.email         AS patient_email
FROM ai_reports r
JOIN users u ON u.id = r.userId
WHERE r.reviewedByDoctor = 0
ORDER BY
    FIELD(r.riskLevel, 'critical', 'high', 'moderate', 'low'),
    r.createdAt DESC;
