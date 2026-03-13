-- 05_assessment_cough_assessment.sql
-- Cough assessment section of the respirology assessment.

CREATE TABLE assessment_cough_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cough_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cough_present IN ('yes', 'no', '')),
    cough_duration VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cough_duration IN ('acute', 'subacute', 'chronic', '')),
    cough_duration_weeks INTEGER
        CHECK (cough_duration_weeks IS NULL OR cough_duration_weeks >= 0),
    cough_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cough_type IN ('dry', 'productive', 'barking', 'paroxysmal', '')),
    cough_timing VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cough_timing IN ('morning', 'nocturnal', 'continuous', 'postprandial', 'exercise', '')),
    sputum_production VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sputum_production IN ('yes', 'no', '')),
    sputum_volume VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sputum_volume IN ('minimal', 'small', 'moderate', 'copious', '')),
    sputum_colour VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sputum_colour IN ('clear', 'white', 'yellow', 'green', 'brown', 'blood-tinged', '')),
    sputum_odour VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sputum_odour IN ('none', 'offensive', '')),
    haemoptysis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (haemoptysis IN ('yes', 'no', '')),
    haemoptysis_volume VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (haemoptysis_volume IN ('streaks', 'teaspoon', 'tablespoon', 'massive', '')),
    cough_triggers TEXT NOT NULL DEFAULT '',
    cough_impact_on_sleep VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (cough_impact_on_sleep IN ('none', 'mild', 'moderate', 'severe', '')),
    cough_impact_on_daily_life VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (cough_impact_on_daily_life IN ('none', 'mild', 'moderate', 'severe', '')),
    post_nasal_drip VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (post_nasal_drip IN ('yes', 'no', '')),
    gastro_oesophageal_reflux VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gastro_oesophageal_reflux IN ('yes', 'no', '')),
    ace_inhibitor_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ace_inhibitor_use IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cough_assessment_updated_at
    BEFORE UPDATE ON assessment_cough_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cough_assessment IS
    'Cough assessment section: duration, type, sputum characteristics, haemoptysis, triggers, and impact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cough_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cough_assessment.cough_present IS
    'Whether cough is present.';
COMMENT ON COLUMN assessment_cough_assessment.cough_duration IS
    'Duration classification: acute (<3 weeks), subacute (3-8 weeks), chronic (>8 weeks), or empty.';
COMMENT ON COLUMN assessment_cough_assessment.cough_duration_weeks IS
    'Duration of cough in weeks.';
COMMENT ON COLUMN assessment_cough_assessment.cough_type IS
    'Character of cough: dry, productive, barking, paroxysmal, or empty.';
COMMENT ON COLUMN assessment_cough_assessment.cough_timing IS
    'Predominant timing: morning, nocturnal, continuous, postprandial, exercise, or empty.';
COMMENT ON COLUMN assessment_cough_assessment.sputum_production IS
    'Whether the patient produces sputum.';
COMMENT ON COLUMN assessment_cough_assessment.sputum_colour IS
    'Colour of sputum: clear, white, yellow, green, brown, blood-tinged, or empty.';
COMMENT ON COLUMN assessment_cough_assessment.haemoptysis IS
    'Whether the patient has haemoptysis (blood in sputum).';
COMMENT ON COLUMN assessment_cough_assessment.haemoptysis_volume IS
    'Volume of haemoptysis: streaks, teaspoon, tablespoon, massive, or empty.';
COMMENT ON COLUMN assessment_cough_assessment.post_nasal_drip IS
    'Whether the patient has post-nasal drip (upper airway cough syndrome).';
COMMENT ON COLUMN assessment_cough_assessment.gastro_oesophageal_reflux IS
    'Whether the patient has gastro-oesophageal reflux (common cough cause).';
COMMENT ON COLUMN assessment_cough_assessment.ace_inhibitor_use IS
    'Whether the patient takes ACE inhibitors (common cause of chronic cough).';
