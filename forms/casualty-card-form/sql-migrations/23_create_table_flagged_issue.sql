CREATE TABLE flagged_issue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- Many-to-one: one NEWS2 result can have many flagged issues
    news2_result_id     UUID NOT NULL REFERENCES news2_result(id) ON DELETE CASCADE,
    -- Flag identification (matches the application-side flag id)
    flag_id             TEXT NOT NULL,
    -- Flag details
    category            TEXT NOT NULL,
    message             TEXT NOT NULL,
    priority            TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low'))
);

-- Index for fetching all flagged issues for a NEWS2 result
CREATE INDEX idx_flagged_issue_news2_result_id
    ON flagged_issue(news2_result_id);

-- Prevent duplicate flags per NEWS2 result
CREATE UNIQUE INDEX idx_flagged_issue_unique
    ON flagged_issue(news2_result_id, flag_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_flagged_issue_updated_at
    BEFORE UPDATE ON flagged_issue
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE flagged_issue IS
    'Many-to-one with news2_result. Safety-critical alerts detected by the flagged issues engine.';
COMMENT ON COLUMN flagged_issue.news2_result_id IS
    'FK to news2_result. One result may have many flagged issues.';
COMMENT ON COLUMN flagged_issue.flag_id IS
    'Application-side flag identifier (e.g. FLAG-NEWS2-CRITICAL, FLAG-GCS-LOW).';
COMMENT ON COLUMN flagged_issue.category IS
    'Flag category (e.g. NEWS2, Airway, Allergy, Safeguarding, Neurology).';
COMMENT ON COLUMN flagged_issue.message IS
    'Human-readable alert message for the clinician.';
COMMENT ON COLUMN flagged_issue.priority IS
    'Alert priority: high, medium, or low.';
COMMENT ON COLUMN flagged_issue.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN flagged_issue.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN flagged_issue.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN flagged_issue.deleted_at IS
    'Timestamp when this row was deleted.';
