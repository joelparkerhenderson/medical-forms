-- 07_assessment_mood_and_anxiety.sql
-- Mood and anxiety section of the psychiatry assessment.

CREATE TABLE assessment_mood_and_anxiety (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    phq9_score INTEGER
        CHECK (phq9_score IS NULL OR (phq9_score >= 0 AND phq9_score <= 27)),
    gad7_score INTEGER
        CHECK (gad7_score IS NULL OR (gad7_score >= 0 AND gad7_score <= 21)),
    depressed_mood VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (depressed_mood IN ('none', 'mild', 'moderate', 'severe', '')),
    anhedonia VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (anhedonia IN ('none', 'mild', 'moderate', 'severe', '')),
    sleep_disturbance VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_disturbance IN ('none', 'insomnia', 'hypersomnia', 'mixed', '')),
    appetite_change VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (appetite_change IN ('none', 'decreased', 'increased', '')),
    energy_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (energy_level IN ('normal', 'low', 'very-low', '')),
    concentration_difficulty VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (concentration_difficulty IN ('none', 'mild', 'moderate', 'severe', '')),
    psychomotor_changes VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (psychomotor_changes IN ('none', 'retardation', 'agitation', '')),
    guilt_worthlessness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (guilt_worthlessness IN ('none', 'mild', 'moderate', 'severe', '')),
    panic_attacks VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (panic_attacks IN ('yes', 'no', '')),
    panic_frequency TEXT NOT NULL DEFAULT '',
    phobias VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (phobias IN ('yes', 'no', '')),
    phobia_details TEXT NOT NULL DEFAULT '',
    obsessions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (obsessions IN ('yes', 'no', '')),
    compulsions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (compulsions IN ('yes', 'no', '')),
    ocd_details TEXT NOT NULL DEFAULT '',
    ptsd_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ptsd_symptoms IN ('yes', 'no', '')),
    ptsd_details TEXT NOT NULL DEFAULT '',
    manic_episodes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (manic_episodes IN ('yes', 'no', '')),
    manic_episode_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mood_and_anxiety_updated_at
    BEFORE UPDATE ON assessment_mood_and_anxiety
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mood_and_anxiety IS
    'Mood and anxiety section: PHQ-9, GAD-7 scores, depression symptoms, anxiety features, panic, OCD, PTSD, and mania screening. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mood_and_anxiety.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mood_and_anxiety.phq9_score IS
    'Patient Health Questionnaire-9 score (0-27) for depression severity.';
COMMENT ON COLUMN assessment_mood_and_anxiety.gad7_score IS
    'Generalised Anxiety Disorder-7 score (0-21) for anxiety severity.';
COMMENT ON COLUMN assessment_mood_and_anxiety.depressed_mood IS
    'Severity of depressed mood: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_mood_and_anxiety.anhedonia IS
    'Severity of anhedonia (loss of pleasure): none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_mood_and_anxiety.sleep_disturbance IS
    'Type of sleep disturbance: none, insomnia, hypersomnia, mixed, or empty.';
COMMENT ON COLUMN assessment_mood_and_anxiety.panic_attacks IS
    'Whether the patient experiences panic attacks.';
COMMENT ON COLUMN assessment_mood_and_anxiety.obsessions IS
    'Whether the patient experiences obsessive thoughts.';
COMMENT ON COLUMN assessment_mood_and_anxiety.compulsions IS
    'Whether the patient engages in compulsive behaviours.';
COMMENT ON COLUMN assessment_mood_and_anxiety.ptsd_symptoms IS
    'Whether the patient has post-traumatic stress symptoms.';
COMMENT ON COLUMN assessment_mood_and_anxiety.manic_episodes IS
    'Whether the patient has experienced manic or hypomanic episodes.';
