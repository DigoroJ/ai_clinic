-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(30)
        CHECK (role IN (
            'patient',
            'doctor',
            'nurse',
            'admin'
        ))
        DEFAULT 'patient',

    phone VARCHAR(30),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- SERVICES
-- =========================================================

CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    icon VARCHAR(100),

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- DOCTORS
-- =========================================================

CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    specialty VARCHAR(150) NOT NULL,

    experience INTEGER DEFAULT 0,

    rating DECIMAL(2,1) DEFAULT 0,

    available BOOLEAN DEFAULT TRUE,

    location VARCHAR(150),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- DOCTOR SERVICES
-- =========================================================

CREATE TABLE doctor_services (
    doctor_id BIGINT NOT NULL,

    service_id BIGINT NOT NULL,

    PRIMARY KEY (doctor_id, service_id),

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE CASCADE
);


-- =========================================================
-- APPOINTMENTS
-- =========================================================

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,

    patient_id BIGINT NOT NULL,

    doctor_id BIGINT NOT NULL,

    service_id BIGINT NOT NULL,

    appointment_date DATE NOT NULL,

    appointment_time TIME NOT NULL,

    status VARCHAR(30)
        CHECK (
            status IN (
                'Pending',
                'Confirmed',
                'Completed',
                'Cancelled'
            )
        )
        DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(id),

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id),

    FOREIGN KEY (service_id)
        REFERENCES services(id)
);


-- =========================================================
-- MEDICAL RECORDS
-- =========================================================

CREATE TABLE medical_records (
    id BIGSERIAL PRIMARY KEY,

    patient_id BIGINT NOT NULL,

    doctor_id BIGINT NOT NULL,

    visit_date DATE NOT NULL,

    diagnosis TEXT,

    notes TEXT,

    treatment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(id),

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
);


-- =========================================================
-- PRESCRIPTIONS
-- =========================================================

CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,

    patient_id BIGINT NOT NULL,

    doctor_id BIGINT NOT NULL,

    medicine VARCHAR(200) NOT NULL,

    dosage VARCHAR(100),

    frequency VARCHAR(100),

    start_date DATE,

    end_date DATE,

    status VARCHAR(30)
        CHECK (
            status IN (
                'Active',
                'Completed',
                'Cancelled'
            )
        )
        DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(id),

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
);


-- =========================================================
-- MESSAGES
-- =========================================================

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,

    sender_id BIGINT NOT NULL,

    recipient_id BIGINT NOT NULL,

    subject VARCHAR(255),

    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sender_id)
        REFERENCES users(id),

    FOREIGN KEY (recipient_id)
        REFERENCES users(id)
);


-- =========================================================
-- HEALTH TIPS
-- =========================================================

CREATE TABLE health_tips (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    category VARCHAR(100),

    icon VARCHAR(100),

    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- SYMPTOMS
-- =========================================================

CREATE TABLE symptoms (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    category VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services
INSERT INTO services
(name, description, icon)
VALUES
(
    'General Consultation',
    'General health check-ups and medical consultations',
    'medical_services'
),
(
    'Pediatrics',
    'Child healthcare services',
    'child_care'
),
(
    'Women''s Health',
    'Women''s health services',
    'favorite'
),
(
    'Chronic Disease',
    'Diabetes, hypertension and other chronic conditions',
    'medication'
),
(
    'Mental Health',
    'Counselling and mental health support',
    'psychology'
);

-- Doctors

INSERT INTO doctors
(name, specialty, experience, rating, available, location)
VALUES
(
    'Dr. Nomsa Dlamini',
    'General Practitioner',
    8,
    4.8,
    true,
    'Mobile Clinic Unit A'
),
(
    'Dr. Lerato Molefe',
    'Pediatrician',
    7,
    4.7,
    true,
    'Mobile Clinic Unit A'
),
(
    'Dr. Thabo Mokoena',
    'General Practitioner',
    10,
    4.9,
    true,
    'Mobile Clinic Unit B'
),
(
    'Dr. Naledi Khumalo',
    'Women''s Health Specialist',
    9,
    4.8,
    true,
    'Mobile Clinic Unit B'
);

-- Health tips
INSERT INTO health_tips
(title, description, category, icon)
VALUES

(
    'Stay Hydrated',
    'Drink enough water throughout the day to support normal body functions.',
    'General',
    'water_drop'
),

(
    'Healthy Eating',
    'Include a variety of vegetables, fruits and nutritious foods in your meals.',
    'Nutrition',
    'restaurant'
),

(
    'Regular Exercise',
    'Regular physical activity can support your overall health and wellbeing.',
    'Fitness',
    'directions_run'
),

(
    'Monitor Your Health',
    'Attend scheduled health checks and follow advice from healthcare professionals.',
    'General',
    'monitor_heart'
),

(
    'Get Enough Rest',
    'Maintain a consistent sleep routine and allow your body adequate time to rest.',
    'Wellness',
    'bedtime'
);

-- Symptoms
INSERT INTO symptoms
(name, description, category)
VALUES
('Fever', 'Elevated body temperature', 'General'),

('Cough', 'Persistent or recurring cough', 'Respiratory'),

('Headache', 'Pain or discomfort in the head', 'General'),

('Sore Throat', 'Pain or irritation in the throat', 'Respiratory'),

('Shortness of Breath', 'Difficulty breathing or feeling breathless', 'Respiratory'),

('Chest Pain', 'Pain or discomfort in the chest', 'Emergency'),

('Abdominal Pain', 'Pain or discomfort in the abdomen', 'General'),

('Nausea', 'Feeling of sickness or urge to vomit', 'General'),

('Vomiting', 'Forceful emptying of stomach contents', 'General'),

('Diarrhea', 'Loose or watery bowel movements', 'General'),

('Fatigue', 'Unusual tiredness or lack of energy', 'General'),

('Dizziness', 'Feeling lightheaded or unsteady', 'General');