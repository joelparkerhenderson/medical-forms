-- 05_assessment_dermatological_symptoms.sql
-- Dermatological symptoms section of the MCAS assessment.

CREATE TABLE assessment_dermatological_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    flushing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flushing IN ('yes', 'no', '')),
    flushing_severity INTEGER
        CHECK (flushing_severity IS NULL OR (flushing_severity >= 0 AND flushing_severity <= 10)),
    flushing_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (flushing_frequency IN ('daily', 'weekly', 'monthly', 'rarely', '')),
    urticaria VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urticaria IN ('yes', 'no', '')),
    urticaria_severity INTEGER
        CHECK (urticaria_severity IS NULL OR (urticaria_severity >= 0 AND urticaria_severity <= 10)),
    angioedema VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (angioedema IN ('yes', 'no', '')),
    angioedema_location TEXT NOT NULL DEFAULT '',
    pruritus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pruritus IN ('yes', 'no', '')),
    pruritus_severity INTEGER
        CHECK (pruritus_severity IS NULL OR (pruritus_severity >= 0 AND pruritus_severity <= 10)),
    dermatographism VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dermatographism IN ('yes', 'no', '')),
    skin_lesions TEXT NOT NULL DEFAULT '',
    dermatological_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_dermatological_symptoms_updated_at
    BEFORE UPDATE ON assessment_dermatological_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_dermatological_symptoms IS
    'Dermatological symptoms section: flushing, urticaria, angioedema, pruritus, and skin lesions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_dermatological_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_dermatological_symptoms.flushing IS
    'Whether the patient experiences flushing episodes: yes, no, or empty string.';
COMMENT ON COLUMN assessment_dermatological_symptoms.flushing_severity IS
    'Flushing severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_dermatological_symptoms.flushing_frequency IS
    'How often flushing occurs: daily, weekly, monthly, rarely, or empty string.';
COMMENT ON COLUMN assessment_dermatological_symptoms.urticaria IS
    'Whether the patient experiences urticaria (hives): yes, no, or empty string.';
COMMENT ON COLUMN assessment_dermatological_symptoms.urticaria_severity IS
    'Urticaria severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_dermatological_symptoms.angioedema IS
    'Whether the patient experiences angioedema: yes, no, or empty string.';
COMMENT ON COLUMN assessment_dermatological_symptoms.angioedema_location IS
    'Free-text description of angioedema location(s).';
COMMENT ON COLUMN assessment_dermatological_symptoms.pruritus IS
    'Whether the patient experiences pruritus (itching): yes, no, or empty string.';
COMMENT ON COLUMN assessment_dermatological_symptoms.pruritus_severity IS
    'Pruritus severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_dermatological_symptoms.dermatographism IS
    'Whether the patient has dermatographism (skin writing): yes, no, or empty string.';
COMMENT ON COLUMN assessment_dermatological_symptoms.skin_lesions IS
    'Free-text description of any skin lesions observed.';
COMMENT ON COLUMN assessment_dermatological_symptoms.dermatological_notes IS
    'Free-text clinician notes on dermatological findings.';
