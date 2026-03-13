-- 12_assessment_goals_priorities.sql
-- Goals and priorities section of the occupational therapy assessment.

CREATE TABLE assessment_goals_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    patient_identified_priorities TEXT NOT NULL DEFAULT '',
    short_term_goals TEXT NOT NULL DEFAULT '',
    long_term_goals TEXT NOT NULL DEFAULT '',
    expected_outcomes TEXT NOT NULL DEFAULT '',
    intervention_plan TEXT NOT NULL DEFAULT '',
    estimated_treatment_duration VARCHAR(50) NOT NULL DEFAULT '',
    treatment_frequency VARCHAR(50) NOT NULL DEFAULT '',
    discharge_criteria TEXT NOT NULL DEFAULT '',
    patient_agreement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_agreement IN ('yes', 'no', '')),
    carer_involvement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_involvement IN ('yes', 'no', '')),
    carer_involvement_details TEXT NOT NULL DEFAULT '',
    onward_referrals TEXT NOT NULL DEFAULT '',
    goals_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_goals_priorities_updated_at
    BEFORE UPDATE ON assessment_goals_priorities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_goals_priorities IS
    'Goals and priorities section: patient-identified priorities, treatment goals, intervention plan, and discharge criteria. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_goals_priorities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_goals_priorities.patient_identified_priorities IS
    'Priorities identified by the patient as most important to address.';
COMMENT ON COLUMN assessment_goals_priorities.short_term_goals IS
    'Short-term treatment goals (typically 4-6 weeks).';
COMMENT ON COLUMN assessment_goals_priorities.long_term_goals IS
    'Long-term treatment goals (typically 3-6 months).';
COMMENT ON COLUMN assessment_goals_priorities.expected_outcomes IS
    'Expected outcomes of occupational therapy intervention.';
COMMENT ON COLUMN assessment_goals_priorities.intervention_plan IS
    'Planned OT interventions and approaches.';
COMMENT ON COLUMN assessment_goals_priorities.estimated_treatment_duration IS
    'Estimated duration of occupational therapy treatment.';
COMMENT ON COLUMN assessment_goals_priorities.treatment_frequency IS
    'Planned frequency of treatment sessions.';
COMMENT ON COLUMN assessment_goals_priorities.discharge_criteria IS
    'Criteria for discharge from occupational therapy.';
COMMENT ON COLUMN assessment_goals_priorities.patient_agreement IS
    'Whether the patient agrees with the proposed plan: yes, no, or empty.';
COMMENT ON COLUMN assessment_goals_priorities.carer_involvement IS
    'Whether carer involvement is planned: yes, no, or empty.';
COMMENT ON COLUMN assessment_goals_priorities.carer_involvement_details IS
    'Details of carer involvement in the treatment plan.';
COMMENT ON COLUMN assessment_goals_priorities.onward_referrals IS
    'Any onward referrals recommended (physiotherapy, social services, etc.).';
COMMENT ON COLUMN assessment_goals_priorities.goals_notes IS
    'Additional clinician notes on goals and priorities.';
