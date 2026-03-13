-- 07_assessment_tinnitus.sql
-- Tinnitus assessment section of the audiology assessment.

CREATE TABLE assessment_tinnitus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_tinnitus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_tinnitus IN ('yes', 'no', '')),
    tinnitus_laterality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tinnitus_laterality IN ('left', 'right', 'bilateral', 'head', '')),
    tinnitus_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tinnitus_type IN ('ringing', 'buzzing', 'hissing', 'pulsatile', 'clicking', 'other', '')),
    tinnitus_description TEXT NOT NULL DEFAULT '',
    tinnitus_onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tinnitus_onset IN ('sudden', 'gradual', '')),
    tinnitus_duration VARCHAR(50) NOT NULL DEFAULT '',
    tinnitus_constancy VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tinnitus_constancy IN ('constant', 'intermittent', '')),
    tinnitus_severity INTEGER
        CHECK (tinnitus_severity IS NULL OR (tinnitus_severity >= 0 AND tinnitus_severity <= 10)),
    tinnitus_impact_on_sleep VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tinnitus_impact_on_sleep IN ('none', 'mild', 'moderate', 'severe', '')),
    tinnitus_impact_on_concentration VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tinnitus_impact_on_concentration IN ('none', 'mild', 'moderate', 'severe', '')),
    tinnitus_impact_on_mood VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tinnitus_impact_on_mood IN ('none', 'mild', 'moderate', 'severe', '')),
    tinnitus_management TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_tinnitus_updated_at
    BEFORE UPDATE ON assessment_tinnitus
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_tinnitus IS
    'Tinnitus assessment section: presence, characteristics, severity, and impact of tinnitus. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_tinnitus.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_tinnitus.has_tinnitus IS
    'Whether the patient experiences tinnitus.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_laterality IS
    'Which ear(s) the tinnitus is perceived in: left, right, bilateral, head (central), or empty string if unanswered.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_type IS
    'Type of tinnitus sound: ringing, buzzing, hissing, pulsatile, clicking, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_description IS
    'Free-text description of the tinnitus.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_onset IS
    'Whether tinnitus onset was sudden or gradual.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_duration IS
    'How long the tinnitus has been present.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_constancy IS
    'Whether the tinnitus is constant or intermittent.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_severity IS
    'Self-rated tinnitus severity on a 0-10 scale (0=not bothersome, 10=extremely bothersome), NULL if unanswered.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_impact_on_sleep IS
    'Degree of tinnitus impact on sleep: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_impact_on_concentration IS
    'Degree of tinnitus impact on concentration: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_impact_on_mood IS
    'Degree of tinnitus impact on mood: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_tinnitus.tinnitus_management IS
    'Current tinnitus management strategies or treatments.';
