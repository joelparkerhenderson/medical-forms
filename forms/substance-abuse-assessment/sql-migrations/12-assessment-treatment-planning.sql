-- 12_assessment_treatment_planning.sql
-- Treatment planning and goals section of the substance abuse assessment.

CREATE TABLE assessment_treatment_planning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    treatment_goal VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (treatment_goal IN ('abstinence', 'harm-reduction', 'controlled-use', 'unsure', '')),
    readiness_to_change VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (readiness_to_change IN ('pre-contemplation', 'contemplation', 'preparation', 'action', 'maintenance', '')),
    motivation_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (motivation_level IN ('low', 'moderate', 'high', '')),
    preferred_treatment_setting VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (preferred_treatment_setting IN ('inpatient', 'residential', 'day-programme', 'outpatient', 'community', '')),
    interested_in_counselling VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interested_in_counselling IN ('yes', 'no', '')),
    interested_in_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interested_in_medication IN ('yes', 'no', '')),
    interested_in_self_help VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interested_in_self_help IN ('yes', 'no', '')),
    barriers_to_treatment TEXT NOT NULL DEFAULT '',
    support_network_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (support_network_available IN ('yes', 'no', '')),
    support_network_details TEXT NOT NULL DEFAULT '',
    risk_of_relapse VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (risk_of_relapse IN ('low', 'moderate', 'high', '')),
    safety_plan_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safety_plan_needed IN ('yes', 'no', '')),
    naloxone_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (naloxone_provided IN ('yes', 'no', 'not-applicable', '')),
    follow_up_plan TEXT NOT NULL DEFAULT '',
    treatment_planning_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatment_planning_updated_at
    BEFORE UPDATE ON assessment_treatment_planning
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatment_planning IS
    'Treatment planning and goals section: treatment goals, readiness to change, preferred settings, and safety planning. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatment_planning.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatment_planning.treatment_goal IS
    'Patient treatment goal: abstinence, harm-reduction, controlled-use, unsure, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.readiness_to_change IS
    'Readiness to change (Stages of Change model): pre-contemplation, contemplation, preparation, action, maintenance, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.motivation_level IS
    'Self-reported motivation level: low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.preferred_treatment_setting IS
    'Preferred treatment setting: inpatient, residential, day-programme, outpatient, community, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.interested_in_counselling IS
    'Whether the patient is interested in counselling: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.interested_in_medication IS
    'Whether the patient is interested in medication-assisted treatment: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.interested_in_self_help IS
    'Whether the patient is interested in self-help groups: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.barriers_to_treatment IS
    'Identified barriers to treatment access and engagement.';
COMMENT ON COLUMN assessment_treatment_planning.support_network_available IS
    'Whether the patient has a support network: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.support_network_details IS
    'Details of support network.';
COMMENT ON COLUMN assessment_treatment_planning.risk_of_relapse IS
    'Assessed risk of relapse: low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.safety_plan_needed IS
    'Whether a safety plan is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.naloxone_provided IS
    'Whether naloxone was provided (for opioid users): yes, no, not-applicable, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.follow_up_plan IS
    'Details of follow-up plan.';
COMMENT ON COLUMN assessment_treatment_planning.treatment_planning_notes IS
    'Additional clinician notes on treatment planning.';
