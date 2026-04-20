-- 11_assessment_psychological_readiness.sql
-- Psychological readiness section of the bone marrow donation assessment.

CREATE TABLE assessment_psychological_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    understands_procedure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (understands_procedure IN ('yes', 'no', '')),
    understands_risks VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (understands_risks IN ('yes', 'no', '')),
    voluntary_decision VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (voluntary_decision IN ('yes', 'no', '')),
    coercion_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (coercion_concerns IN ('yes', 'no', '')),
    coercion_details TEXT NOT NULL DEFAULT '',
    anxiety_about_procedure VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (anxiety_about_procedure IN ('none', 'mild', 'moderate', 'severe', '')),
    previous_psychological_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_psychological_issues IN ('yes', 'no', '')),
    psychological_issue_details TEXT NOT NULL DEFAULT '',
    support_network VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (support_network IN ('yes', 'no', '')),
    time_off_work_arranged VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (time_off_work_arranged IN ('yes', 'no', 'not-applicable', '')),
    donor_advocate_consulted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (donor_advocate_consulted IN ('yes', 'no', '')),
    willing_to_proceed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (willing_to_proceed IN ('yes', 'no', 'undecided', '')),
    psychological_readiness_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_psychological_readiness_updated_at
    BEFORE UPDATE ON assessment_psychological_readiness
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychological_readiness IS
    'Psychological readiness section: understanding, voluntariness, anxiety, support. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_psychological_readiness.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_psychological_readiness.understands_procedure IS
    'Whether donor understands the procedure: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.understands_risks IS
    'Whether donor understands the risks: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.voluntary_decision IS
    'Whether the decision to donate is voluntary: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.coercion_concerns IS
    'Whether there are concerns about coercion: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.anxiety_about_procedure IS
    'Level of anxiety about the procedure: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.previous_psychological_issues IS
    'Whether donor has previous psychological issues: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.support_network IS
    'Whether donor has adequate support network: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.time_off_work_arranged IS
    'Whether time off work has been arranged: yes, no, not-applicable, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.donor_advocate_consulted IS
    'Whether a donor advocate has been consulted: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.willing_to_proceed IS
    'Whether donor is willing to proceed: yes, no, undecided, or empty.';
COMMENT ON COLUMN assessment_psychological_readiness.psychological_readiness_notes IS
    'Additional clinician notes on psychological readiness.';
