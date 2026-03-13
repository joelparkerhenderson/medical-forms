-- ============================================================
-- 10_assessment_foot_assessment.sql
-- Foot assessment section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_foot_assessment (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    foot_pulses             TEXT NOT NULL DEFAULT ''
                            CHECK (foot_pulses IN ('present', 'reduced', 'absent', '')),
    monofilament_test       TEXT NOT NULL DEFAULT ''
                            CHECK (monofilament_test IN ('normal', 'abnormal', '')),
    vibration_sense         TEXT NOT NULL DEFAULT ''
                            CHECK (vibration_sense IN ('normal', 'reduced', 'absent', '')),
    foot_deformity          TEXT NOT NULL DEFAULT ''
                            CHECK (foot_deformity IN ('yes', 'no', '')),
    callus_present          TEXT NOT NULL DEFAULT ''
                            CHECK (callus_present IN ('yes', 'no', '')),
    ulcer_present           TEXT NOT NULL DEFAULT ''
                            CHECK (ulcer_present IN ('yes', 'no', '')),
    previous_amputation     TEXT NOT NULL DEFAULT ''
                            CHECK (previous_amputation IN ('yes', 'no', '')),
    foot_risk_category      TEXT NOT NULL DEFAULT ''
                            CHECK (foot_risk_category IN ('low', 'moderate', 'high', '')),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_foot_assessment_updated_at
    BEFORE UPDATE ON assessment_foot_assessment
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_foot_assessment IS
    '1:1 with assessment. Comprehensive diabetic foot examination findings.';
COMMENT ON COLUMN assessment_foot_assessment.foot_pulses IS
    'Foot pulse status: present, reduced, absent, or empty string.';
COMMENT ON COLUMN assessment_foot_assessment.monofilament_test IS
    '10g monofilament test result: normal, abnormal, or empty string.';
COMMENT ON COLUMN assessment_foot_assessment.ulcer_present IS
    'Active foot ulcer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_foot_assessment.previous_amputation IS
    'History of amputation: yes, no, or empty string.';
COMMENT ON COLUMN assessment_foot_assessment.foot_risk_category IS
    'Overall foot risk classification: low, moderate, high, or empty string.';
