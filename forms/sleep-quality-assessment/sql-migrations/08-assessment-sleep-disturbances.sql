-- 08_assessment_sleep_disturbances.sql
-- Sleep disturbances section of the sleep quality assessment (PSQI Component 5).

CREATE TABLE assessment_sleep_disturbances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- PSQI Q5b-j: frequency of sleep disturbances (0-3 scale each)
    wake_middle_of_night INTEGER
        CHECK (wake_middle_of_night IS NULL OR (wake_middle_of_night >= 0 AND wake_middle_of_night <= 3)),
    bathroom_use INTEGER
        CHECK (bathroom_use IS NULL OR (bathroom_use >= 0 AND bathroom_use <= 3)),
    breathing_difficulty INTEGER
        CHECK (breathing_difficulty IS NULL OR (breathing_difficulty >= 0 AND breathing_difficulty <= 3)),
    cough_or_snore INTEGER
        CHECK (cough_or_snore IS NULL OR (cough_or_snore >= 0 AND cough_or_snore <= 3)),
    feel_too_cold INTEGER
        CHECK (feel_too_cold IS NULL OR (feel_too_cold >= 0 AND feel_too_cold <= 3)),
    feel_too_hot INTEGER
        CHECK (feel_too_hot IS NULL OR (feel_too_hot >= 0 AND feel_too_hot <= 3)),
    bad_dreams INTEGER
        CHECK (bad_dreams IS NULL OR (bad_dreams >= 0 AND bad_dreams <= 3)),
    pain INTEGER
        CHECK (pain IS NULL OR (pain >= 0 AND pain <= 3)),
    other_disturbance INTEGER
        CHECK (other_disturbance IS NULL OR (other_disturbance >= 0 AND other_disturbance <= 3)),
    other_disturbance_description TEXT NOT NULL DEFAULT '',

    -- Additional disturbance details
    restless_legs VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (restless_legs IN ('yes', 'no', '')),
    sleep_talking VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_talking IN ('yes', 'no', '')),
    sleep_walking VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_walking IN ('yes', 'no', '')),
    teeth_grinding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (teeth_grinding IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_disturbances_updated_at
    BEFORE UPDATE ON assessment_sleep_disturbances
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_disturbances IS
    'Sleep disturbances section (PSQI Component 5): frequency of various causes of nighttime waking. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_disturbances.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_disturbances.wake_middle_of_night IS
    'PSQI Q5b: frequency of waking in the middle of the night; 0=not at all, 1=<1/week, 2=1-2/week, 3=>=3/week.';
COMMENT ON COLUMN assessment_sleep_disturbances.bathroom_use IS
    'PSQI Q5c: frequency of getting up to use the bathroom; same 0-3 scale.';
COMMENT ON COLUMN assessment_sleep_disturbances.breathing_difficulty IS
    'PSQI Q5d: frequency of not being able to breathe comfortably; same 0-3 scale.';
COMMENT ON COLUMN assessment_sleep_disturbances.cough_or_snore IS
    'PSQI Q5e: frequency of coughing or snoring loudly; same 0-3 scale.';
COMMENT ON COLUMN assessment_sleep_disturbances.feel_too_cold IS
    'PSQI Q5f: frequency of feeling too cold; same 0-3 scale.';
COMMENT ON COLUMN assessment_sleep_disturbances.feel_too_hot IS
    'PSQI Q5g: frequency of feeling too hot; same 0-3 scale.';
COMMENT ON COLUMN assessment_sleep_disturbances.bad_dreams IS
    'PSQI Q5h: frequency of having bad dreams; same 0-3 scale.';
COMMENT ON COLUMN assessment_sleep_disturbances.pain IS
    'PSQI Q5i: frequency of having pain; same 0-3 scale.';
COMMENT ON COLUMN assessment_sleep_disturbances.other_disturbance IS
    'PSQI Q5j: frequency of other disturbances; same 0-3 scale.';
COMMENT ON COLUMN assessment_sleep_disturbances.other_disturbance_description IS
    'Description of other sleep disturbance.';
COMMENT ON COLUMN assessment_sleep_disturbances.restless_legs IS
    'Whether patient experiences restless leg symptoms.';
COMMENT ON COLUMN assessment_sleep_disturbances.sleep_talking IS
    'Whether patient talks during sleep.';
COMMENT ON COLUMN assessment_sleep_disturbances.sleep_walking IS
    'Whether patient walks during sleep.';
COMMENT ON COLUMN assessment_sleep_disturbances.teeth_grinding IS
    'Whether patient grinds teeth during sleep (bruxism).';
