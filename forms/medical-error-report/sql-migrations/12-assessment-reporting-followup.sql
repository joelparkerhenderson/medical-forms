-- 12_assessment_reporting_followup.sql
-- Reporting and follow-up section of the medical error report.

CREATE TABLE assessment_reporting_followup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    internal_reference VARCHAR(100) NOT NULL DEFAULT '',
    reported_to_datix VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reported_to_datix IN ('yes', 'no', '')),
    datix_reference VARCHAR(100) NOT NULL DEFAULT '',
    reported_to_nrls VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reported_to_nrls IN ('yes', 'no', '')),
    nrls_reference VARCHAR(100) NOT NULL DEFAULT '',
    reported_to_cqc VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reported_to_cqc IN ('yes', 'no', '')),
    reported_to_hsib VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reported_to_hsib IN ('yes', 'no', '')),
    reported_to_coroner VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reported_to_coroner IN ('yes', 'no', '')),
    safeguarding_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safeguarding_referral IN ('yes', 'no', '')),
    lessons_learned TEXT NOT NULL DEFAULT '',
    shared_with_team VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (shared_with_team IN ('yes', 'no', '')),
    follow_up_review_date DATE,
    follow_up_reviewer VARCHAR(255) NOT NULL DEFAULT '',
    final_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (final_status IN ('open', 'under-review', 'closed', '')),
    closure_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_reporting_followup_updated_at
    BEFORE UPDATE ON assessment_reporting_followup
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_reporting_followup IS
    'Reporting and follow-up section: regulatory reporting, lessons learned, case closure. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_reporting_followup.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_reporting_followup.internal_reference IS
    'Internal incident reference number.';
COMMENT ON COLUMN assessment_reporting_followup.reported_to_datix IS
    'Whether reported to Datix: yes, no, or empty.';
COMMENT ON COLUMN assessment_reporting_followup.datix_reference IS
    'Datix incident reference number.';
COMMENT ON COLUMN assessment_reporting_followup.reported_to_nrls IS
    'Whether reported to National Reporting and Learning System: yes, no, or empty.';
COMMENT ON COLUMN assessment_reporting_followup.nrls_reference IS
    'NRLS reference number.';
COMMENT ON COLUMN assessment_reporting_followup.reported_to_cqc IS
    'Whether reported to Care Quality Commission: yes, no, or empty.';
COMMENT ON COLUMN assessment_reporting_followup.reported_to_hsib IS
    'Whether reported to Healthcare Safety Investigation Branch: yes, no, or empty.';
COMMENT ON COLUMN assessment_reporting_followup.reported_to_coroner IS
    'Whether reported to the coroner: yes, no, or empty.';
COMMENT ON COLUMN assessment_reporting_followup.safeguarding_referral IS
    'Whether a safeguarding referral was made: yes, no, or empty.';
COMMENT ON COLUMN assessment_reporting_followup.lessons_learned IS
    'Summary of lessons learned from the incident.';
COMMENT ON COLUMN assessment_reporting_followup.shared_with_team IS
    'Whether lessons learned have been shared with the team: yes, no, or empty.';
COMMENT ON COLUMN assessment_reporting_followup.follow_up_review_date IS
    'Date for follow-up review.';
COMMENT ON COLUMN assessment_reporting_followup.follow_up_reviewer IS
    'Person responsible for follow-up review.';
COMMENT ON COLUMN assessment_reporting_followup.final_status IS
    'Final status of the report: open, under-review, closed, or empty.';
COMMENT ON COLUMN assessment_reporting_followup.closure_date IS
    'Date the incident report was closed.';
