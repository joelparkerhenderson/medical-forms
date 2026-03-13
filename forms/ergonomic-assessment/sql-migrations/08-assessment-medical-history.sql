-- ============================================================
-- 08_assessment_medical_history.sql
-- Musculoskeletal and medical history (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_medical_history (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id                   UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Musculoskeletal conditions stored as an array
    musculoskeletal_conditions      TEXT[] NOT NULL DEFAULT '{}',
    previous_injuries               TEXT NOT NULL DEFAULT '',
    surgeries                       TEXT NOT NULL DEFAULT '',
    chronic_pain                    TEXT NOT NULL DEFAULT ''
                                    CHECK (chronic_pain IN ('yes', 'no', '')),
    rsi_carpal_tunnel               TEXT NOT NULL DEFAULT ''
                                    CHECK (rsi_carpal_tunnel IN ('yes', 'no', '')),
    back_problems                   TEXT NOT NULL DEFAULT ''
                                    CHECK (back_problems IN ('yes', 'no', '')),

    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history relevant to ergonomic assessment: MSK conditions, injuries, surgeries, chronic pain, RSI, back problems.';
COMMENT ON COLUMN assessment_medical_history.musculoskeletal_conditions IS
    'Array of musculoskeletal condition identifiers (e.g. osteoarthritis, fibromyalgia, disc-herniation).';
COMMENT ON COLUMN assessment_medical_history.previous_injuries IS
    'Free-text description of previous injuries.';
COMMENT ON COLUMN assessment_medical_history.surgeries IS
    'Free-text description of previous surgeries.';
COMMENT ON COLUMN assessment_medical_history.chronic_pain IS
    'Whether the patient has chronic pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.rsi_carpal_tunnel IS
    'Whether the patient has RSI or carpal tunnel syndrome: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.back_problems IS
    'Whether the patient has back problems: yes, no, or empty.';
