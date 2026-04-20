-- 06_assessment_physical_examination.sql
-- Physical examination section of the bone marrow donation assessment.

CREATE TABLE assessment_physical_examination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    blood_pressure_systolic INTEGER
        CHECK (blood_pressure_systolic IS NULL OR (blood_pressure_systolic >= 50 AND blood_pressure_systolic <= 300)),
    blood_pressure_diastolic INTEGER
        CHECK (blood_pressure_diastolic IS NULL OR (blood_pressure_diastolic >= 20 AND blood_pressure_diastolic <= 200)),
    heart_rate INTEGER
        CHECK (heart_rate IS NULL OR (heart_rate >= 20 AND heart_rate <= 300)),
    temperature_celsius NUMERIC(4,1),
    respiratory_rate INTEGER
        CHECK (respiratory_rate IS NULL OR (respiratory_rate >= 5 AND respiratory_rate <= 60)),
    oxygen_saturation INTEGER
        CHECK (oxygen_saturation IS NULL OR (oxygen_saturation >= 50 AND oxygen_saturation <= 100)),
    general_appearance VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (general_appearance IN ('well', 'unwell', 'acutely-unwell', '')),
    cardiovascular_examination VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cardiovascular_examination IN ('normal', 'abnormal', '')),
    cardiovascular_findings TEXT NOT NULL DEFAULT '',
    respiratory_examination VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (respiratory_examination IN ('normal', 'abnormal', '')),
    respiratory_findings TEXT NOT NULL DEFAULT '',
    abdominal_examination VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (abdominal_examination IN ('normal', 'abnormal', '')),
    abdominal_findings TEXT NOT NULL DEFAULT '',
    venous_access_assessment VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (venous_access_assessment IN ('good', 'adequate', 'poor', '')),
    venous_access_notes TEXT NOT NULL DEFAULT '',
    posterior_iliac_crest_assessment VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (posterior_iliac_crest_assessment IN ('suitable', 'unsuitable', '')),
    physical_examination_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_physical_examination_updated_at
    BEFORE UPDATE ON assessment_physical_examination
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_physical_examination IS
    'Physical examination section: vital signs, systems examination, venous access, iliac crest assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_physical_examination.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_physical_examination.blood_pressure_systolic IS
    'Systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_physical_examination.blood_pressure_diastolic IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_physical_examination.heart_rate IS
    'Heart rate in beats per minute.';
COMMENT ON COLUMN assessment_physical_examination.temperature_celsius IS
    'Body temperature in degrees Celsius.';
COMMENT ON COLUMN assessment_physical_examination.respiratory_rate IS
    'Respiratory rate in breaths per minute.';
COMMENT ON COLUMN assessment_physical_examination.oxygen_saturation IS
    'Peripheral oxygen saturation percentage.';
COMMENT ON COLUMN assessment_physical_examination.general_appearance IS
    'General appearance: well, unwell, acutely-unwell, or empty.';
COMMENT ON COLUMN assessment_physical_examination.cardiovascular_examination IS
    'Cardiovascular examination finding: normal, abnormal, or empty.';
COMMENT ON COLUMN assessment_physical_examination.respiratory_examination IS
    'Respiratory examination finding: normal, abnormal, or empty.';
COMMENT ON COLUMN assessment_physical_examination.abdominal_examination IS
    'Abdominal examination finding: normal, abnormal, or empty.';
COMMENT ON COLUMN assessment_physical_examination.venous_access_assessment IS
    'Assessment of peripheral venous access for apheresis: good, adequate, poor, or empty.';
COMMENT ON COLUMN assessment_physical_examination.posterior_iliac_crest_assessment IS
    'Assessment of posterior iliac crest suitability for bone marrow harvest: suitable, unsuitable, or empty.';
COMMENT ON COLUMN assessment_physical_examination.physical_examination_notes IS
    'Additional clinician notes on physical examination.';
