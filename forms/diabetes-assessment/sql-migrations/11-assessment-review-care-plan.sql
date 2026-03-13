-- ============================================================
-- 11_assessment_review_care_plan.sql
-- Review & care plan section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_review_care_plan (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    clinician_name          TEXT NOT NULL DEFAULT '',
    review_date             DATE,
    hba1c_target_agreed     NUMERIC(5,1) CHECK (hba1c_target_agreed IS NULL OR hba1c_target_agreed >= 0),
    care_plan_updated       TEXT NOT NULL DEFAULT ''
                            CHECK (care_plan_updated IN ('yes', 'no', '')),
    clinical_notes          TEXT NOT NULL DEFAULT '',
    referrals               TEXT NOT NULL DEFAULT '',
    next_review_date        DATE,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_review_care_plan_updated_at
    BEFORE UPDATE ON assessment_review_care_plan
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_review_care_plan IS
    '1:1 with assessment. Clinician review details and care plan.';
COMMENT ON COLUMN assessment_review_care_plan.clinician_name IS
    'Name of reviewing clinician. Empty string if not recorded.';
COMMENT ON COLUMN assessment_review_care_plan.review_date IS
    'Date of clinical review. NULL if not recorded.';
COMMENT ON COLUMN assessment_review_care_plan.hba1c_target_agreed IS
    'Agreed HbA1c target. NULL if not set.';
COMMENT ON COLUMN assessment_review_care_plan.care_plan_updated IS
    'Whether care plan was updated: yes, no, or empty string.';
COMMENT ON COLUMN assessment_review_care_plan.clinical_notes IS
    'Free-text clinical notes and findings summary.';
COMMENT ON COLUMN assessment_review_care_plan.referrals IS
    'Free-text list of referrals made (e.g. Ophthalmology, Podiatry).';
COMMENT ON COLUMN assessment_review_care_plan.next_review_date IS
    'Date of next scheduled review. NULL if not set.';
