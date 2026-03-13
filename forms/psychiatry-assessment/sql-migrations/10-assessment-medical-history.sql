-- 10_assessment_medical_history.sql
-- Medical history section of the psychiatry assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    chronic_conditions TEXT NOT NULL DEFAULT '',
    neurological_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neurological_conditions IN ('yes', 'no', '')),
    neurological_details TEXT NOT NULL DEFAULT '',
    endocrine_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (endocrine_conditions IN ('yes', 'no', '')),
    endocrine_details TEXT NOT NULL DEFAULT '',
    cardiovascular_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiovascular_conditions IN ('yes', 'no', '')),
    cardiovascular_details TEXT NOT NULL DEFAULT '',
    head_injuries VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (head_injuries IN ('yes', 'no', '')),
    head_injury_details TEXT NOT NULL DEFAULT '',
    seizure_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seizure_history IN ('yes', 'no', '')),
    known_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_allergies IN ('yes', 'no', '')),
    allergy_details TEXT NOT NULL DEFAULT '',
    recent_blood_tests VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_blood_tests IN ('yes', 'no', '')),
    blood_test_results TEXT NOT NULL DEFAULT '',
    physical_health_screening VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (physical_health_screening IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: comorbid physical conditions relevant to psychiatric care including neurological, endocrine, and cardiovascular. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.chronic_conditions IS
    'Free-text list of chronic physical conditions.';
COMMENT ON COLUMN assessment_medical_history.neurological_conditions IS
    'Whether the patient has neurological conditions (epilepsy, MS, etc.).';
COMMENT ON COLUMN assessment_medical_history.endocrine_conditions IS
    'Whether the patient has endocrine conditions (thyroid, diabetes, etc.).';
COMMENT ON COLUMN assessment_medical_history.cardiovascular_conditions IS
    'Whether the patient has cardiovascular conditions.';
COMMENT ON COLUMN assessment_medical_history.head_injuries IS
    'Whether the patient has had significant head injuries.';
COMMENT ON COLUMN assessment_medical_history.seizure_history IS
    'Whether the patient has a history of seizures.';
COMMENT ON COLUMN assessment_medical_history.known_allergies IS
    'Whether the patient has known allergies.';
COMMENT ON COLUMN assessment_medical_history.physical_health_screening IS
    'Whether physical health screening has been completed (important for psychiatric patients).';
