-- 04_assessment_chief_complaint.sql
-- Chief complaint section of the audiology assessment.

CREATE TABLE assessment_chief_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_complaint TEXT NOT NULL DEFAULT '',
    complaint_duration VARCHAR(50) NOT NULL DEFAULT '',
    onset_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (onset_type IN ('sudden', 'gradual', 'fluctuating', '')),
    laterality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (laterality IN ('left', 'right', 'bilateral', '')),
    ear_most_affected VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ear_most_affected IN ('left', 'right', 'equal', '')),
    difficulty_in_noise VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (difficulty_in_noise IN ('yes', 'no', '')),
    difficulty_on_phone VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (difficulty_on_phone IN ('yes', 'no', '')),
    difficulty_with_television VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (difficulty_with_television IN ('yes', 'no', '')),
    asks_others_to_repeat VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asks_others_to_repeat IN ('yes', 'no', '')),
    additional_concerns TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chief_complaint_updated_at
    BEFORE UPDATE ON assessment_chief_complaint
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chief_complaint IS
    'Chief complaint section: presenting hearing concern, onset, and functional difficulties. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chief_complaint.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chief_complaint.primary_complaint IS
    'Primary hearing concern described by the patient.';
COMMENT ON COLUMN assessment_chief_complaint.complaint_duration IS
    'How long the hearing concern has been present.';
COMMENT ON COLUMN assessment_chief_complaint.onset_type IS
    'Type of onset: sudden, gradual, fluctuating, or empty string if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.laterality IS
    'Which ear(s) are affected: left, right, bilateral, or empty string if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.ear_most_affected IS
    'Which ear is most affected: left, right, equal, or empty string if unanswered.';
COMMENT ON COLUMN assessment_chief_complaint.difficulty_in_noise IS
    'Whether the patient has difficulty hearing in noisy environments.';
COMMENT ON COLUMN assessment_chief_complaint.difficulty_on_phone IS
    'Whether the patient has difficulty hearing on the phone.';
COMMENT ON COLUMN assessment_chief_complaint.difficulty_with_television IS
    'Whether the patient needs the television volume louder than others.';
COMMENT ON COLUMN assessment_chief_complaint.asks_others_to_repeat IS
    'Whether the patient frequently asks others to repeat themselves.';
COMMENT ON COLUMN assessment_chief_complaint.additional_concerns IS
    'Any additional hearing-related concerns.';
