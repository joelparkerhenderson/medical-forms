-- 04_assessment_screening_purpose.sql
-- Screening purpose section of the autism assessment.

CREATE TABLE assessment_screening_purpose (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    reason_for_referral TEXT NOT NULL DEFAULT '',
    who_requested_screening VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (who_requested_screening IN ('self', 'parent', 'teacher', 'gp', 'specialist', 'other', '')),
    who_requested_screening_other TEXT NOT NULL DEFAULT '',
    previous_autism_assessment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_autism_assessment IN ('yes', 'no', '')),
    previous_assessment_details TEXT NOT NULL DEFAULT '',
    previous_assessment_date DATE,
    main_concerns TEXT NOT NULL DEFAULT '',
    impact_on_daily_life TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_screening_purpose_updated_at
    BEFORE UPDATE ON assessment_screening_purpose
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_screening_purpose IS
    'Screening purpose section: reason for referral, who requested screening, and previous assessments. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_screening_purpose.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_screening_purpose.reason_for_referral IS
    'Free-text explanation of why the screening was requested.';
COMMENT ON COLUMN assessment_screening_purpose.who_requested_screening IS
    'Who initiated the screening request: self, parent, teacher, gp, specialist, other, or empty.';
COMMENT ON COLUMN assessment_screening_purpose.who_requested_screening_other IS
    'Details when who_requested_screening is other.';
COMMENT ON COLUMN assessment_screening_purpose.previous_autism_assessment IS
    'Whether the patient has had a previous autism assessment: yes, no, or empty.';
COMMENT ON COLUMN assessment_screening_purpose.previous_assessment_details IS
    'Details of any previous autism assessment.';
COMMENT ON COLUMN assessment_screening_purpose.previous_assessment_date IS
    'Date of the previous autism assessment, if applicable.';
COMMENT ON COLUMN assessment_screening_purpose.main_concerns IS
    'Main concerns that prompted the referral.';
COMMENT ON COLUMN assessment_screening_purpose.impact_on_daily_life IS
    'Description of how concerns impact daily living.';
