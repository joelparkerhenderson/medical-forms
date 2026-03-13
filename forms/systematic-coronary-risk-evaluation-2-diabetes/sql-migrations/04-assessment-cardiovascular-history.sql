-- 04_assessment_cardiovascular_history.sql
-- Cardiovascular history section of the assessment.

CREATE TABLE assessment_cardiovascular_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_mi VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_mi IN ('yes', 'no', '')),
    previous_stroke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_stroke IN ('yes', 'no', '')),
    previous_tia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_tia IN ('yes', 'no', '')),
    peripheral_arterial_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (peripheral_arterial_disease IN ('yes', 'no', '')),
    heart_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (heart_failure IN ('yes', 'no', '')),
    atrial_fibrillation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (atrial_fibrillation IN ('yes', 'no', '')),
    family_cvd_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_cvd_history IN ('yes', 'no', '')),
    family_cvd_details TEXT NOT NULL DEFAULT '',
    current_chest_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_chest_pain IN ('yes', 'no', '')),
    current_dyspnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_dyspnoea IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiovascular_history_updated_at
    BEFORE UPDATE ON assessment_cardiovascular_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular_history IS
    'Cardiovascular history section: prior events, family history, and current symptoms. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cardiovascular_history.previous_mi IS
    'Whether patient has had a previous myocardial infarction.';
COMMENT ON COLUMN assessment_cardiovascular_history.previous_stroke IS
    'Whether patient has had a previous stroke.';
COMMENT ON COLUMN assessment_cardiovascular_history.previous_tia IS
    'Whether patient has had a previous transient ischaemic attack.';
COMMENT ON COLUMN assessment_cardiovascular_history.peripheral_arterial_disease IS
    'Whether patient has peripheral arterial disease.';
COMMENT ON COLUMN assessment_cardiovascular_history.heart_failure IS
    'Whether patient has heart failure.';
COMMENT ON COLUMN assessment_cardiovascular_history.atrial_fibrillation IS
    'Whether patient has atrial fibrillation.';
