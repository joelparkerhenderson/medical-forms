-- ============================================================
-- 04_assessment_glycaemic_control.sql
-- Glycaemic control section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_glycaemic_control (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    hba1c_value                 NUMERIC(5,1) CHECK (hba1c_value IS NULL OR hba1c_value >= 0),
    hba1c_unit                  TEXT NOT NULL DEFAULT ''
                                CHECK (hba1c_unit IN ('mmolMol', 'percent', '')),
    hba1c_target                NUMERIC(5,1) CHECK (hba1c_target IS NULL OR hba1c_target >= 0),
    fasting_glucose             NUMERIC(5,1) CHECK (fasting_glucose IS NULL OR fasting_glucose >= 0),
    postprandial_glucose        NUMERIC(5,1) CHECK (postprandial_glucose IS NULL OR postprandial_glucose >= 0),
    glucose_monitoring_type     TEXT NOT NULL DEFAULT ''
                                CHECK (glucose_monitoring_type IN ('smbg', 'cgm', 'flash', 'none', '')),
    hypoglycaemia_frequency     TEXT NOT NULL DEFAULT ''
                                CHECK (hypoglycaemia_frequency IN ('never', 'rarely', 'monthly', 'weekly', 'daily', '')),
    severe_hypoglycaemia        TEXT NOT NULL DEFAULT ''
                                CHECK (severe_hypoglycaemia IN ('yes', 'no', '')),
    time_in_range               NUMERIC(5,1) CHECK (time_in_range IS NULL OR (time_in_range >= 0 AND time_in_range <= 100)),

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_glycaemic_control_updated_at
    BEFORE UPDATE ON assessment_glycaemic_control
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_glycaemic_control IS
    '1:1 with assessment. Glycaemic markers and monitoring details.';
COMMENT ON COLUMN assessment_glycaemic_control.hba1c_value IS
    'HbA1c value in the unit specified by hba1c_unit. NULL if not recorded.';
COMMENT ON COLUMN assessment_glycaemic_control.hba1c_unit IS
    'Unit for HbA1c: mmolMol or percent. Empty string if not specified.';
COMMENT ON COLUMN assessment_glycaemic_control.hba1c_target IS
    'Agreed HbA1c target value. NULL if not set.';
COMMENT ON COLUMN assessment_glycaemic_control.time_in_range IS
    'Percentage of time glucose is in target range (0-100). NULL if not recorded.';
COMMENT ON COLUMN assessment_glycaemic_control.hypoglycaemia_frequency IS
    'Frequency of hypoglycaemic episodes. Empty string if unanswered.';
COMMENT ON COLUMN assessment_glycaemic_control.severe_hypoglycaemia IS
    'Whether severe hypoglycaemia requiring third-party assistance has occurred.';
