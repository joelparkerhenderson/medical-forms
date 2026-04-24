CREATE TABLE clinical_review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    post_vaccination_observation SMALLINT CHECK (post_vaccination_observation IS NULL OR post_vaccination_observation BETWEEN 1 AND 5),
    immediate_reaction VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (immediate_reaction IN ('yes', 'no', '')),
    reaction_details TEXT NOT NULL DEFAULT '',
    next_dose_due DATE,
    catch_up_schedule_needed VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (catch_up_schedule_needed IN ('yes', 'no', '')),
    referral_needed VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (referral_needed IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',
    reviewing_clinician VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_clinical_review_updated_at
    BEFORE UPDATE ON clinical_review
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clinical_review IS
    'Clinical review including post-vaccination observation and referral needs. One-to-one child of assessment.';

COMMENT ON COLUMN clinical_review.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN clinical_review.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN clinical_review.post_vaccination_observation IS
    'Post vaccination observation.';
COMMENT ON COLUMN clinical_review.immediate_reaction IS
    'Immediate reaction. One of: yes, no.';
COMMENT ON COLUMN clinical_review.reaction_details IS
    'Reaction details.';
COMMENT ON COLUMN clinical_review.next_dose_due IS
    'Next dose due.';
COMMENT ON COLUMN clinical_review.catch_up_schedule_needed IS
    'Catch up schedule needed. One of: yes, no.';
COMMENT ON COLUMN clinical_review.referral_needed IS
    'Referral needed. One of: yes, no.';
COMMENT ON COLUMN clinical_review.clinician_notes IS
    'Clinician notes.';
COMMENT ON COLUMN clinical_review.reviewing_clinician IS
    'Reviewing clinician.';
COMMENT ON COLUMN clinical_review.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN clinical_review.updated_at IS
    'Timestamp when this row was last updated.';
