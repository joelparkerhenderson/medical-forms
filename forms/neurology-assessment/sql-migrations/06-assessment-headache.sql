-- 06_assessment_headache.sql
-- Headache assessment section of the neurology assessment.

CREATE TABLE assessment_headache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    headache_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (headache_present IN ('yes', 'no', '')),
    headache_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (headache_type IN ('tension', 'migraine', 'cluster', 'thunderclap', 'other', '')),
    headache_severity INTEGER
        CHECK (headache_severity IS NULL OR (headache_severity >= 0 AND headache_severity <= 10)),
    headache_location VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (headache_location IN ('frontal', 'temporal', 'occipital', 'vertex', 'diffuse', 'unilateral', '')),
    headache_side VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (headache_side IN ('left', 'right', 'bilateral', '')),
    headache_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (headache_frequency IN ('daily', 'weekly', 'monthly', 'episodic', '')),
    headache_duration VARCHAR(50) NOT NULL DEFAULT '',
    aura VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (aura IN ('yes', 'no', '')),
    aura_type TEXT NOT NULL DEFAULT '',
    photophobia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (photophobia IN ('yes', 'no', '')),
    phonophobia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (phonophobia IN ('yes', 'no', '')),
    nausea_with_headache VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nausea_with_headache IN ('yes', 'no', '')),
    neck_stiffness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neck_stiffness IN ('yes', 'no', '')),
    worst_headache_ever VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (worst_headache_ever IN ('yes', 'no', '')),
    headache_triggers TEXT NOT NULL DEFAULT '',
    headache_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_headache_updated_at
    BEFORE UPDATE ON assessment_headache
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_headache IS
    'Headache assessment section: type, severity, location, associated symptoms, and red flags. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_headache.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_headache.headache_present IS
    'Whether the patient has headache: yes, no, or empty string.';
COMMENT ON COLUMN assessment_headache.headache_type IS
    'Headache classification: tension, migraine, cluster, thunderclap, other, or empty string.';
COMMENT ON COLUMN assessment_headache.headache_severity IS
    'Headache severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_headache.headache_location IS
    'Primary headache location: frontal, temporal, occipital, vertex, diffuse, unilateral, or empty string.';
COMMENT ON COLUMN assessment_headache.headache_side IS
    'Side of headache: left, right, bilateral, or empty string.';
COMMENT ON COLUMN assessment_headache.headache_frequency IS
    'How often headaches occur: daily, weekly, monthly, episodic, or empty string.';
COMMENT ON COLUMN assessment_headache.headache_duration IS
    'Typical duration of headache episodes.';
COMMENT ON COLUMN assessment_headache.aura IS
    'Whether the patient experiences aura: yes, no, or empty string.';
COMMENT ON COLUMN assessment_headache.aura_type IS
    'Free-text description of aura symptoms (visual, sensory, motor).';
COMMENT ON COLUMN assessment_headache.photophobia IS
    'Whether the patient has photophobia (light sensitivity): yes, no, or empty string.';
COMMENT ON COLUMN assessment_headache.phonophobia IS
    'Whether the patient has phonophobia (sound sensitivity): yes, no, or empty string.';
COMMENT ON COLUMN assessment_headache.nausea_with_headache IS
    'Whether headache is accompanied by nausea: yes, no, or empty string.';
COMMENT ON COLUMN assessment_headache.neck_stiffness IS
    'Whether neck stiffness is present (meningism red flag): yes, no, or empty string.';
COMMENT ON COLUMN assessment_headache.worst_headache_ever IS
    'Whether this is the worst headache ever experienced (thunderclap red flag): yes, no, or empty string.';
COMMENT ON COLUMN assessment_headache.headache_triggers IS
    'Free-text description of known headache triggers.';
COMMENT ON COLUMN assessment_headache.headache_notes IS
    'Free-text clinician notes on headache assessment.';
