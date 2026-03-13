-- ============================================================
-- 09_assessment_medical_history.sql
-- Step 8: Medical History (1:1 with assessment).
-- ============================================================
-- Existing cardiovascular conditions and family history.
-- Known CVD triggers a flag since PREVENT is for primary
-- prevention only.
-- ============================================================

CREATE TABLE assessment_medical_history (
    -- Primary key
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id                   UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Known CVD (triggers FLAG-CVD-001 if yes)
    has_known_cvd                   TEXT NOT NULL DEFAULT ''
                                    CHECK (has_known_cvd IN ('yes', 'no', '')),

    -- CVD-specific conditions (conditional on has_known_cvd = 'yes')
    previous_mi                     TEXT NOT NULL DEFAULT ''
                                    CHECK (previous_mi IN ('yes', 'no', '')),
    previous_stroke                 TEXT NOT NULL DEFAULT ''
                                    CHECK (previous_stroke IN ('yes', 'no', '')),
    heart_failure                   TEXT NOT NULL DEFAULT ''
                                    CHECK (heart_failure IN ('yes', 'no', '')),
    peripheral_arterial_disease     TEXT NOT NULL DEFAULT ''
                                    CHECK (peripheral_arterial_disease IN ('yes', 'no', '')),

    -- Other cardiovascular conditions
    atrial_fibrillation             TEXT NOT NULL DEFAULT ''
                                    CHECK (atrial_fibrillation IN ('yes', 'no', '')),

    -- Family history
    family_cvd_history              TEXT NOT NULL DEFAULT ''
                                    CHECK (family_cvd_history IN ('yes', 'no', '')),
    family_cvd_details              TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conditional constraint: CVD sub-conditions only when has_known_cvd = 'yes'
ALTER TABLE assessment_medical_history
    ADD CONSTRAINT chk_previous_mi_requires_cvd
    CHECK (previous_mi = '' OR has_known_cvd = 'yes');

ALTER TABLE assessment_medical_history
    ADD CONSTRAINT chk_previous_stroke_requires_cvd
    CHECK (previous_stroke = '' OR has_known_cvd = 'yes');

ALTER TABLE assessment_medical_history
    ADD CONSTRAINT chk_heart_failure_requires_cvd
    CHECK (heart_failure = '' OR has_known_cvd = 'yes');

ALTER TABLE assessment_medical_history
    ADD CONSTRAINT chk_peripheral_arterial_disease_requires_cvd
    CHECK (peripheral_arterial_disease = '' OR has_known_cvd = 'yes');

-- Conditional constraint: family_cvd_details only when family_cvd_history = 'yes'
ALTER TABLE assessment_medical_history
    ADD CONSTRAINT chk_family_details_requires_history
    CHECK (family_cvd_details = '' OR family_cvd_history = 'yes');

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    '1:1 with assessment. Step 8: Existing cardiovascular conditions and family history.';
COMMENT ON COLUMN assessment_medical_history.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_medical_history.has_known_cvd IS
    'Whether patient has known CVD: yes, no, or empty string if unanswered. PREVENT is primary prevention only.';
COMMENT ON COLUMN assessment_medical_history.previous_mi IS
    'Previous myocardial infarction: yes, no, or empty string. Only valid when has_known_cvd = yes.';
COMMENT ON COLUMN assessment_medical_history.previous_stroke IS
    'Previous stroke: yes, no, or empty string. Only valid when has_known_cvd = yes.';
COMMENT ON COLUMN assessment_medical_history.heart_failure IS
    'Heart failure: yes, no, or empty string. Only valid when has_known_cvd = yes.';
COMMENT ON COLUMN assessment_medical_history.peripheral_arterial_disease IS
    'Peripheral arterial disease: yes, no, or empty string. Only valid when has_known_cvd = yes.';
COMMENT ON COLUMN assessment_medical_history.atrial_fibrillation IS
    'Atrial fibrillation: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_medical_history.family_cvd_history IS
    'Family history of premature CVD: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_medical_history.family_cvd_details IS
    'Free-text details of family CVD history. Empty string if unanswered.';
COMMENT ON COLUMN assessment_medical_history.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_medical_history.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
