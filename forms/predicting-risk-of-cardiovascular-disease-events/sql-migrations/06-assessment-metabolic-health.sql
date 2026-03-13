-- ============================================================
-- 06_assessment_metabolic_health.sql
-- Step 5: Metabolic Health (1:1 with assessment).
-- ============================================================
-- Diabetes status, HbA1c, fasting glucose, BMI, and waist
-- circumference. Diabetes is a primary PREVENT model input.
-- ============================================================

CREATE TABLE assessment_metabolic_health (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Diabetes status
    has_diabetes                TEXT NOT NULL DEFAULT ''
                                CHECK (has_diabetes IN ('yes', 'no', '')),
    diabetes_type               TEXT NOT NULL DEFAULT ''
                                CHECK (diabetes_type IN ('type1', 'type2', 'gestational', 'other', '')),

    -- HbA1c
    hba1c_value                 NUMERIC(5,1) CHECK (hba1c_value IS NULL OR (hba1c_value >= 2 AND hba1c_value <= 200)),
    hba1c_unit                  TEXT NOT NULL DEFAULT ''
                                CHECK (hba1c_unit IN ('percent', 'mmolMol', '')),

    -- Glucose
    fasting_glucose             NUMERIC(5,1) CHECK (fasting_glucose IS NULL OR (fasting_glucose >= 30 AND fasting_glucose <= 600)),

    -- Body composition
    bmi                         NUMERIC(4,1) CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 80)),
    waist_circumference_cm      NUMERIC(5,1) CHECK (waist_circumference_cm IS NULL OR (waist_circumference_cm >= 40 AND waist_circumference_cm <= 200)),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conditional constraint: diabetes_type only set when has_diabetes = 'yes'
ALTER TABLE assessment_metabolic_health
    ADD CONSTRAINT chk_diabetes_type_requires_diabetes
    CHECK (diabetes_type = '' OR has_diabetes = 'yes');

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_metabolic_health_updated_at
    BEFORE UPDATE ON assessment_metabolic_health
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_metabolic_health IS
    '1:1 with assessment. Step 5: Diabetes status, HbA1c, glucose, BMI, and waist circumference.';
COMMENT ON COLUMN assessment_metabolic_health.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_metabolic_health.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_metabolic_health.has_diabetes IS
    'Whether patient has diabetes: yes, no, or empty string if unanswered. Primary PREVENT input.';
COMMENT ON COLUMN assessment_metabolic_health.diabetes_type IS
    'Type of diabetes: type1, type2, gestational, other, or empty string if unanswered. Only valid when has_diabetes = yes.';
COMMENT ON COLUMN assessment_metabolic_health.hba1c_value IS
    'HbA1c value. NULL if not recorded. Interpretation depends on hba1c_unit.';
COMMENT ON COLUMN assessment_metabolic_health.hba1c_unit IS
    'HbA1c unit: percent (NGSP/DCCT), mmolMol (IFCC), or empty string if unanswered.';
COMMENT ON COLUMN assessment_metabolic_health.fasting_glucose IS
    'Fasting glucose in mg/dL. NULL if not recorded.';
COMMENT ON COLUMN assessment_metabolic_health.bmi IS
    'Body Mass Index in kg/m2. NULL if not recorded. Used in PREVENT risk model.';
COMMENT ON COLUMN assessment_metabolic_health.waist_circumference_cm IS
    'Waist circumference in centimetres. NULL if not recorded.';
COMMENT ON COLUMN assessment_metabolic_health.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_metabolic_health.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
