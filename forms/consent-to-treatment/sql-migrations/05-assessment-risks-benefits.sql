-- 05_assessment_risks_benefits.sql
-- Risks and benefits section of the consent to treatment form.

CREATE TABLE assessment_risks_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    common_risks TEXT NOT NULL DEFAULT '',
    uncommon_risks TEXT NOT NULL DEFAULT '',
    rare_risks TEXT NOT NULL DEFAULT '',
    specific_risks_to_patient TEXT NOT NULL DEFAULT '',
    risk_of_not_having_treatment TEXT NOT NULL DEFAULT '',
    expected_benefits TEXT NOT NULL DEFAULT '',
    success_rate_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (success_rate_discussed IN ('yes', 'no', '')),
    success_rate_details TEXT NOT NULL DEFAULT '',
    recovery_time_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recovery_time_discussed IN ('yes', 'no', '')),
    expected_recovery_details TEXT NOT NULL DEFAULT '',
    limitations_after_procedure TEXT NOT NULL DEFAULT '',
    follow_up_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (follow_up_required IN ('yes', 'no', '')),
    follow_up_details TEXT NOT NULL DEFAULT '',
    risks_benefits_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_risks_benefits_updated_at
    BEFORE UPDATE ON assessment_risks_benefits
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_risks_benefits IS
    'Risks and benefits section: common, uncommon, and rare risks; expected benefits; recovery expectations. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_risks_benefits.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_risks_benefits.common_risks IS
    'Common risks of the procedure (occurring in more than 1 in 100 cases).';
COMMENT ON COLUMN assessment_risks_benefits.uncommon_risks IS
    'Uncommon risks of the procedure (between 1 in 100 and 1 in 1000 cases).';
COMMENT ON COLUMN assessment_risks_benefits.rare_risks IS
    'Rare but serious risks of the procedure (less than 1 in 1000 cases).';
COMMENT ON COLUMN assessment_risks_benefits.specific_risks_to_patient IS
    'Risks that are specific to this patient given their medical history.';
COMMENT ON COLUMN assessment_risks_benefits.risk_of_not_having_treatment IS
    'Risks and consequences of not having the treatment.';
COMMENT ON COLUMN assessment_risks_benefits.expected_benefits IS
    'Expected benefits and outcomes of the procedure.';
COMMENT ON COLUMN assessment_risks_benefits.success_rate_discussed IS
    'Whether success rates were discussed with the patient: yes, no, or empty.';
COMMENT ON COLUMN assessment_risks_benefits.success_rate_details IS
    'Details of success rates discussed.';
COMMENT ON COLUMN assessment_risks_benefits.recovery_time_discussed IS
    'Whether recovery time was discussed: yes, no, or empty.';
COMMENT ON COLUMN assessment_risks_benefits.expected_recovery_details IS
    'Details of expected recovery timeline and milestones.';
COMMENT ON COLUMN assessment_risks_benefits.limitations_after_procedure IS
    'Expected limitations after the procedure (e.g. driving, work, lifting).';
COMMENT ON COLUMN assessment_risks_benefits.follow_up_required IS
    'Whether follow-up appointments are required: yes, no, or empty.';
COMMENT ON COLUMN assessment_risks_benefits.follow_up_details IS
    'Details of follow-up plan.';
COMMENT ON COLUMN assessment_risks_benefits.risks_benefits_notes IS
    'Additional clinician notes on risks and benefits discussion.';
