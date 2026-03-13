-- 11_assessment_medical_history.sql
-- Medical history section of the attention deficit assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_head_injury_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_head_injury_history IN ('yes', 'no', '')),
    head_injury_details TEXT NOT NULL DEFAULT '',
    has_seizure_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_seizure_history IN ('yes', 'no', '')),
    seizure_details TEXT NOT NULL DEFAULT '',
    has_thyroid_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_thyroid_disorder IN ('yes', 'no', '')),
    thyroid_details TEXT NOT NULL DEFAULT '',
    has_cardiac_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cardiac_conditions IN ('yes', 'no', '')),
    cardiac_details TEXT NOT NULL DEFAULT '',
    birth_complications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (birth_complications IN ('yes', 'no', '')),
    birth_complication_details TEXT NOT NULL DEFAULT '',
    family_history_of_adhd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_of_adhd IN ('yes', 'no', '')),
    family_adhd_details TEXT NOT NULL DEFAULT '',
    family_psychiatric_history TEXT NOT NULL DEFAULT '',
    other_medical_history TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: conditions that may mimic or exacerbate ADHD, family history, and safety considerations for medication. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_head_injury_history IS
    'Whether the patient has a history of head injury.';
COMMENT ON COLUMN assessment_medical_history.head_injury_details IS
    'Details of head injury history.';
COMMENT ON COLUMN assessment_medical_history.has_seizure_history IS
    'Whether the patient has a history of seizures (important for stimulant prescribing).';
COMMENT ON COLUMN assessment_medical_history.seizure_details IS
    'Details of seizure history.';
COMMENT ON COLUMN assessment_medical_history.has_thyroid_disorder IS
    'Whether the patient has a thyroid disorder (can mimic ADHD symptoms).';
COMMENT ON COLUMN assessment_medical_history.thyroid_details IS
    'Details of thyroid disorder.';
COMMENT ON COLUMN assessment_medical_history.has_cardiac_conditions IS
    'Whether the patient has cardiac conditions (contraindication for stimulants).';
COMMENT ON COLUMN assessment_medical_history.cardiac_details IS
    'Details of cardiac conditions.';
COMMENT ON COLUMN assessment_medical_history.birth_complications IS
    'Whether there were birth complications (risk factor for ADHD).';
COMMENT ON COLUMN assessment_medical_history.birth_complication_details IS
    'Details of birth complications.';
COMMENT ON COLUMN assessment_medical_history.family_history_of_adhd IS
    'Whether there is a family history of ADHD.';
COMMENT ON COLUMN assessment_medical_history.family_adhd_details IS
    'Details of family ADHD history.';
COMMENT ON COLUMN assessment_medical_history.family_psychiatric_history IS
    'Free-text family psychiatric history.';
COMMENT ON COLUMN assessment_medical_history.other_medical_history IS
    'Other relevant medical history.';
