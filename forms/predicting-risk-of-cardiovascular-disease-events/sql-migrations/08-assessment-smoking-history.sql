-- ============================================================
-- 08_assessment_smoking_history.sql
-- Step 7: Smoking History (1:1 with assessment).
-- ============================================================
-- Smoking status is a primary input to the PREVENT risk model.
-- Current smoking adds significant CVD risk points.
-- ============================================================

CREATE TABLE assessment_smoking_history (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Smoking status
    smoking_status      TEXT NOT NULL DEFAULT ''
                        CHECK (smoking_status IN ('never', 'current', 'former', '')),

    -- Smoking details (applicable to current and former smokers)
    cigarettes_per_day  SMALLINT CHECK (cigarettes_per_day IS NULL OR (cigarettes_per_day >= 0 AND cigarettes_per_day <= 100)),
    years_smoked        SMALLINT CHECK (years_smoked IS NULL OR (years_smoked >= 0 AND years_smoked <= 80)),

    -- Cessation (applicable to former smokers)
    years_since_quit    SMALLINT CHECK (years_since_quit IS NULL OR (years_since_quit >= 0 AND years_since_quit <= 80)),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conditional constraint: years_since_quit only applicable to former smokers
ALTER TABLE assessment_smoking_history
    ADD CONSTRAINT chk_years_since_quit_requires_former
    CHECK (years_since_quit IS NULL OR smoking_status = 'former');

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_smoking_history_updated_at
    BEFORE UPDATE ON assessment_smoking_history
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_smoking_history IS
    '1:1 with assessment. Step 7: Smoking status and history for PREVENT risk calculation.';
COMMENT ON COLUMN assessment_smoking_history.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_smoking_history.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_smoking_history.smoking_status IS
    'Smoking status: never, current, former, or empty string if unanswered. Primary PREVENT input.';
COMMENT ON COLUMN assessment_smoking_history.cigarettes_per_day IS
    'Cigarettes per day (current or when smoking for former). NULL if unanswered.';
COMMENT ON COLUMN assessment_smoking_history.years_smoked IS
    'Total years smoked. NULL if unanswered.';
COMMENT ON COLUMN assessment_smoking_history.years_since_quit IS
    'Years since smoking cessation. Only applicable for former smokers. NULL if unanswered.';
COMMENT ON COLUMN assessment_smoking_history.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_smoking_history.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
