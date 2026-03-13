-- ============================================================
-- 12_assessment_clinical_review.sql
-- Step 10: Clinical Review (1:1 with assessment).
-- ============================================================
-- Clinician review including diagnosis, summary, follow-up
-- plan, urgency level, and reviewer details.
-- ============================================================

CREATE TABLE assessment_clinical_review (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Clinical review fields
    clinical_summary        TEXT NOT NULL DEFAULT '',
    diagnosis               TEXT NOT NULL DEFAULT '',
    follow_up_plan          TEXT NOT NULL DEFAULT '',
    urgency_level           SMALLINT CHECK (urgency_level IS NULL OR (urgency_level >= 1 AND urgency_level <= 5)),
    reviewer_name           TEXT NOT NULL DEFAULT '',
    review_date             TEXT NOT NULL DEFAULT '',
    additional_notes        TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_clinical_review_updated_at
    BEFORE UPDATE ON assessment_clinical_review
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_clinical_review IS
    '1:1 with assessment. Step 10: Clinical Review - diagnosis, summary, follow-up plan, urgency, reviewer.';
COMMENT ON COLUMN assessment_clinical_review.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_clinical_review.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_clinical_review.clinical_summary IS
    'Clinical summary of the hematology assessment. Empty string if unanswered.';
COMMENT ON COLUMN assessment_clinical_review.diagnosis IS
    'Diagnosis based on the hematology assessment. Empty string if unanswered.';
COMMENT ON COLUMN assessment_clinical_review.follow_up_plan IS
    'Follow-up plan and recommendations. Empty string if unanswered.';
COMMENT ON COLUMN assessment_clinical_review.urgency_level IS
    'Urgency level (1=routine, 5=critical). NULL if unanswered.';
COMMENT ON COLUMN assessment_clinical_review.reviewer_name IS
    'Name of the reviewing clinician. Empty string if unanswered.';
COMMENT ON COLUMN assessment_clinical_review.review_date IS
    'Date of clinical review (ISO 8601). Empty string if unanswered.';
COMMENT ON COLUMN assessment_clinical_review.additional_notes IS
    'Additional notes from the clinician. Empty string if unanswered.';
COMMENT ON COLUMN assessment_clinical_review.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_clinical_review.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
