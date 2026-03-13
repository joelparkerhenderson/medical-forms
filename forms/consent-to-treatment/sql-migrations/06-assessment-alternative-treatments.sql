-- 06_assessment_alternative_treatments.sql
-- Alternative treatments section of the consent to treatment form.

CREATE TABLE assessment_alternative_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    alternatives_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alternatives_discussed IN ('yes', 'no', '')),
    conservative_management_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (conservative_management_discussed IN ('yes', 'no', '')),
    conservative_management_details TEXT NOT NULL DEFAULT '',
    alternative_procedures_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alternative_procedures_discussed IN ('yes', 'no', '')),
    alternative_procedures_details TEXT NOT NULL DEFAULT '',
    no_treatment_option_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (no_treatment_option_discussed IN ('yes', 'no', '')),
    no_treatment_consequences TEXT NOT NULL DEFAULT '',
    patient_preference TEXT NOT NULL DEFAULT '',
    reason_for_chosen_treatment TEXT NOT NULL DEFAULT '',
    alternative_treatments_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_alternative_treatments_updated_at
    BEFORE UPDATE ON assessment_alternative_treatments
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_alternative_treatments IS
    'Alternative treatments section: conservative management, alternative procedures, no-treatment option. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_alternative_treatments.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_alternative_treatments.alternatives_discussed IS
    'Whether alternative treatments were discussed with the patient: yes, no, or empty.';
COMMENT ON COLUMN assessment_alternative_treatments.conservative_management_discussed IS
    'Whether conservative (non-surgical) management was discussed: yes, no, or empty.';
COMMENT ON COLUMN assessment_alternative_treatments.conservative_management_details IS
    'Details of conservative management options discussed.';
COMMENT ON COLUMN assessment_alternative_treatments.alternative_procedures_discussed IS
    'Whether alternative procedures were discussed: yes, no, or empty.';
COMMENT ON COLUMN assessment_alternative_treatments.alternative_procedures_details IS
    'Details of alternative procedures discussed.';
COMMENT ON COLUMN assessment_alternative_treatments.no_treatment_option_discussed IS
    'Whether the option of no treatment was discussed: yes, no, or empty.';
COMMENT ON COLUMN assessment_alternative_treatments.no_treatment_consequences IS
    'Consequences of choosing no treatment.';
COMMENT ON COLUMN assessment_alternative_treatments.patient_preference IS
    'Patient stated preference after discussion of alternatives.';
COMMENT ON COLUMN assessment_alternative_treatments.reason_for_chosen_treatment IS
    'Reason the chosen treatment was selected over alternatives.';
COMMENT ON COLUMN assessment_alternative_treatments.alternative_treatments_notes IS
    'Additional clinician notes on alternative treatments discussion.';
