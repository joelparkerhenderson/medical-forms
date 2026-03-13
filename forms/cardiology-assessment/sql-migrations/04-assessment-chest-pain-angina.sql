-- 04_assessment_chest_pain_angina.sql
-- Chest pain and angina section of the cardiology assessment.

CREATE TABLE assessment_chest_pain_angina (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_chest_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_chest_pain IN ('yes', 'no', '')),
    chest_pain_character VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (chest_pain_character IN ('crushing', 'squeezing', 'burning', 'stabbing', 'pressure', 'other', '')),
    chest_pain_character_other TEXT NOT NULL DEFAULT '',
    chest_pain_location VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (chest_pain_location IN ('central', 'left-sided', 'right-sided', 'diffuse', 'other', '')),
    chest_pain_radiation VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (chest_pain_radiation IN ('left-arm', 'jaw', 'back', 'right-arm', 'none', 'other', '')),
    chest_pain_duration_minutes INTEGER
        CHECK (chest_pain_duration_minutes IS NULL OR chest_pain_duration_minutes >= 0),
    chest_pain_trigger VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (chest_pain_trigger IN ('exertion', 'rest', 'emotional-stress', 'cold', 'meals', 'other', '')),
    relieved_by_rest VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (relieved_by_rest IN ('yes', 'no', '')),
    relieved_by_gtn VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (relieved_by_gtn IN ('yes', 'no', '')),
    ccs_angina_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ccs_angina_class IN ('I', 'II', 'III', 'IV', '')),
    angina_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (angina_frequency IN ('daily', 'weekly', 'monthly', 'rarely', '')),
    chest_pain_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_chest_pain_angina_updated_at
    BEFORE UPDATE ON assessment_chest_pain_angina
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_chest_pain_angina IS
    'Chest pain and angina section: pain characteristics, triggers, CCS angina classification. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_chest_pain_angina.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_chest_pain_angina.has_chest_pain IS
    'Whether the patient experiences chest pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.chest_pain_character IS
    'Character of chest pain: crushing, squeezing, burning, stabbing, pressure, other, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.chest_pain_location IS
    'Location of chest pain: central, left-sided, right-sided, diffuse, other, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.chest_pain_radiation IS
    'Radiation pattern: left-arm, jaw, back, right-arm, none, other, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.chest_pain_duration_minutes IS
    'Typical duration of chest pain episode in minutes.';
COMMENT ON COLUMN assessment_chest_pain_angina.chest_pain_trigger IS
    'Primary trigger for chest pain: exertion, rest, emotional-stress, cold, meals, other, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.relieved_by_rest IS
    'Whether chest pain is relieved by rest: yes, no, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.relieved_by_gtn IS
    'Whether chest pain is relieved by glyceryl trinitrate (GTN): yes, no, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.ccs_angina_class IS
    'Canadian Cardiovascular Society angina class: I, II, III, IV, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.angina_frequency IS
    'Frequency of angina episodes: daily, weekly, monthly, rarely, or empty.';
COMMENT ON COLUMN assessment_chest_pain_angina.chest_pain_notes IS
    'Additional clinician notes on chest pain or angina.';
