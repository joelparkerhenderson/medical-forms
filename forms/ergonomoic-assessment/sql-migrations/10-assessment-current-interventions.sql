-- 10_assessment_current_interventions.sql
-- Step 8: Current interventions section of the ergonomic assessment.

CREATE TABLE assessment_current_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    uses_ergonomic_equipment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_ergonomic_equipment IN ('yes', 'no', '')),
    ergonomic_equipment_details TEXT NOT NULL DEFAULT '',
    uses_wrist_splint VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_wrist_splint IN ('yes', 'no', '')),
    uses_back_support VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_back_support IN ('yes', 'no', '')),
    receives_physiotherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (receives_physiotherapy IN ('yes', 'no', '')),
    physiotherapy_details TEXT NOT NULL DEFAULT '',
    receives_occupational_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (receives_occupational_therapy IN ('yes', 'no', '')),
    takes_pain_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_pain_medication IN ('yes', 'no', '')),
    pain_medication_details TEXT NOT NULL DEFAULT '',
    performs_stretching_exercises VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (performs_stretching_exercises IN ('yes', 'no', '')),
    stretching_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stretching_frequency IN ('daily', 'weekly', 'occasionally', '')),
    workplace_assessment_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (workplace_assessment_done IN ('yes', 'no', '')),
    workplace_assessment_date DATE,
    modifications_made TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_interventions_updated_at
    BEFORE UPDATE ON assessment_current_interventions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_interventions IS
    'Step 8 Current Interventions: existing ergonomic interventions and treatments. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_interventions.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_interventions.uses_ergonomic_equipment IS
    'Whether the patient currently uses ergonomic equipment.';
COMMENT ON COLUMN assessment_current_interventions.ergonomic_equipment_details IS
    'Details of ergonomic equipment in use.';
COMMENT ON COLUMN assessment_current_interventions.uses_wrist_splint IS
    'Whether the patient uses a wrist splint.';
COMMENT ON COLUMN assessment_current_interventions.uses_back_support IS
    'Whether the patient uses a lumbar support or back brace.';
COMMENT ON COLUMN assessment_current_interventions.receives_physiotherapy IS
    'Whether the patient is receiving physiotherapy.';
COMMENT ON COLUMN assessment_current_interventions.physiotherapy_details IS
    'Details of physiotherapy treatment.';
COMMENT ON COLUMN assessment_current_interventions.receives_occupational_therapy IS
    'Whether the patient is receiving occupational therapy.';
COMMENT ON COLUMN assessment_current_interventions.takes_pain_medication IS
    'Whether the patient takes pain medication for musculoskeletal symptoms.';
COMMENT ON COLUMN assessment_current_interventions.pain_medication_details IS
    'Details of pain medication.';
COMMENT ON COLUMN assessment_current_interventions.performs_stretching_exercises IS
    'Whether the patient performs stretching or strengthening exercises.';
COMMENT ON COLUMN assessment_current_interventions.stretching_frequency IS
    'How often stretching exercises are performed.';
COMMENT ON COLUMN assessment_current_interventions.workplace_assessment_done IS
    'Whether a previous workplace assessment has been conducted.';
COMMENT ON COLUMN assessment_current_interventions.workplace_assessment_date IS
    'Date of the most recent workplace assessment, NULL if unanswered.';
COMMENT ON COLUMN assessment_current_interventions.modifications_made IS
    'Description of workplace modifications already implemented.';
COMMENT ON COLUMN assessment_current_interventions.additional_notes IS
    'Additional notes about current interventions.';
