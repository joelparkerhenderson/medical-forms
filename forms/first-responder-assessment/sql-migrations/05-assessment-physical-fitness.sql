-- 05_assessment_physical_fitness.sql
-- Physical fitness assessment section of the first responder assessment.

CREATE TABLE assessment_physical_fitness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cardiovascular_fitness VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cardiovascular_fitness IN ('not-competent', 'developing', 'competent', 'expert', '')),
    shuttle_run_level INTEGER
        CHECK (shuttle_run_level IS NULL OR (shuttle_run_level >= 0 AND shuttle_run_level <= 25)),
    vo2_max NUMERIC(4,1)
        CHECK (vo2_max IS NULL OR (vo2_max >= 0 AND vo2_max <= 100)),
    muscular_strength VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (muscular_strength IN ('not-competent', 'developing', 'competent', 'expert', '')),
    grip_strength_kg NUMERIC(5,1)
        CHECK (grip_strength_kg IS NULL OR grip_strength_kg >= 0),
    manual_handling_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (manual_handling_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    patient_carry_ability VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_carry_ability IN ('yes', 'no', '')),
    flexibility_mobility VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (flexibility_mobility IN ('not-competent', 'developing', 'competent', 'expert', '')),
    balance_coordination VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (balance_coordination IN ('not-competent', 'developing', 'competent', 'expert', '')),
    resting_heart_rate_bpm INTEGER
        CHECK (resting_heart_rate_bpm IS NULL OR (resting_heart_rate_bpm >= 20 AND resting_heart_rate_bpm <= 250)),
    blood_pressure_systolic INTEGER
        CHECK (blood_pressure_systolic IS NULL OR (blood_pressure_systolic >= 50 AND blood_pressure_systolic <= 300)),
    blood_pressure_diastolic INTEGER
        CHECK (blood_pressure_diastolic IS NULL OR (blood_pressure_diastolic >= 20 AND blood_pressure_diastolic <= 200)),
    physical_fitness_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_physical_fitness_updated_at
    BEFORE UPDATE ON assessment_physical_fitness
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_physical_fitness IS
    'Physical fitness assessment section: cardiovascular fitness, strength, manual handling, flexibility, and vital signs. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_physical_fitness.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_physical_fitness.cardiovascular_fitness IS
    'Cardiovascular fitness competency level: not-competent, developing, competent, expert, or empty.';
COMMENT ON COLUMN assessment_physical_fitness.shuttle_run_level IS
    'Multi-stage fitness test (bleep test) level achieved.';
COMMENT ON COLUMN assessment_physical_fitness.vo2_max IS
    'Estimated VO2 max in ml/kg/min.';
COMMENT ON COLUMN assessment_physical_fitness.muscular_strength IS
    'Muscular strength competency level.';
COMMENT ON COLUMN assessment_physical_fitness.grip_strength_kg IS
    'Grip strength in kilograms.';
COMMENT ON COLUMN assessment_physical_fitness.manual_handling_competency IS
    'Manual handling competency level for patient lifting and carry.';
COMMENT ON COLUMN assessment_physical_fitness.patient_carry_ability IS
    'Whether the responder can carry a patient on a stretcher: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_fitness.flexibility_mobility IS
    'Flexibility and mobility competency level.';
COMMENT ON COLUMN assessment_physical_fitness.balance_coordination IS
    'Balance and coordination competency level.';
COMMENT ON COLUMN assessment_physical_fitness.resting_heart_rate_bpm IS
    'Resting heart rate in beats per minute.';
COMMENT ON COLUMN assessment_physical_fitness.blood_pressure_systolic IS
    'Systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_physical_fitness.blood_pressure_diastolic IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_physical_fitness.physical_fitness_notes IS
    'Additional notes on physical fitness assessment.';
