-- =========================================================
-- RUN ONCE in the Supabase SQL editor (safe to run again).
-- Adds what the nurse / doctor dashboards and AI triage need.
-- =========================================================

-- 1. Link a doctor LOGIN (users row) to a doctor PROFILE (doctors row)
ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS user_id BIGINT UNIQUE REFERENCES users(id);


-- 2. AI predictions (saved by POST /api/ai/triage/predict)
CREATE TABLE IF NOT EXISTS ai_predictions (
    id BIGSERIAL PRIMARY KEY,

    patient_id BIGINT NOT NULL REFERENCES users(id),

    predicted_disease VARCHAR(100) NOT NULL,

    confidence NUMERIC(5,4),

    model_name VARCHAR(100),

    model_version VARCHAR(50),

    input_data JSONB,

    priority VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_patient
    ON ai_predictions (patient_id, created_at DESC);


-- 3. Nurse assessments (vitals taken before the doctor sees the patient)
CREATE TABLE IF NOT EXISTS nurse_assessments (
    id BIGSERIAL PRIMARY KEY,

    appointment_id BIGINT REFERENCES appointments(id) ON DELETE SET NULL,

    patient_id BIGINT NOT NULL REFERENCES users(id),

    nurse_id BIGINT NOT NULL REFERENCES users(id),

    temperature NUMERIC(4,1),

    blood_pressure VARCHAR(10),

    pulse INTEGER,

    weight NUMERIC(5,1),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nurse_assessments_appointment
    ON nurse_assessments (appointment_id);

CREATE INDEX IF NOT EXISTS idx_nurse_assessments_patient
    ON nurse_assessments (patient_id, created_at DESC);
