-- ============================================================
-- 11_flagged_issue.sql
-- Safety flags for a satisfaction result (many-to-one).
-- ============================================================
-- Each row is an alert detected by the flagged issues engine.
-- Flags are raised for conditions such as Very Dissatisfied
-- responses (score 1), Communication concerns (score <= 2),
-- poor overall satisfaction (mean <= 2.4), and first-visit
-- fair-satisfaction retention concerns.
-- ============================================================

CREATE TABLE flagged_issue (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: one satisfaction result can have many flagged issues
    satisfaction_result_id      UUID NOT NULL REFERENCES satisfaction_result(id) ON DELETE CASCADE,

    -- Flag identification (matches the application-side flag id)
    flag_id                     TEXT NOT NULL,

    -- Flag details
    category                    TEXT NOT NULL,
    message                     TEXT NOT NULL,
    priority                    TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all flagged issues for a satisfaction result
CREATE INDEX idx_flagged_issue_satisfaction_result_id
    ON flagged_issue(satisfaction_result_id);

-- Prevent duplicate flags per satisfaction result
CREATE UNIQUE INDEX idx_flagged_issue_unique
    ON flagged_issue(satisfaction_result_id, flag_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_flagged_issue_updated_at
    BEFORE UPDATE ON flagged_issue
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE flagged_issue IS
    'Many-to-one with satisfaction_result. Alerts detected by the flagged issues engine.';
COMMENT ON COLUMN flagged_issue.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN flagged_issue.satisfaction_result_id IS
    'FK to satisfaction_result. One result may have many flagged issues.';
COMMENT ON COLUMN flagged_issue.flag_id IS
    'Application-side flag identifier (e.g. FLAG-VDIS-listening, FLAG-COMM-timeSpent).';
COMMENT ON COLUMN flagged_issue.category IS
    'Flag category (e.g. Very Dissatisfied Response, Communication Concern, Poor Overall Satisfaction).';
COMMENT ON COLUMN flagged_issue.message IS
    'Human-readable alert message for the clinician.';
COMMENT ON COLUMN flagged_issue.priority IS
    'Alert priority: high, medium, or low.';
COMMENT ON COLUMN flagged_issue.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN flagged_issue.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
