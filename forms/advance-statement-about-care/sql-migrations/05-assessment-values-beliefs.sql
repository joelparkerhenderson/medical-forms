-- 05_assessment_values_beliefs.sql
-- Values and beliefs section of the advance statement about care.

CREATE TABLE assessment_values_beliefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    personal_values TEXT NOT NULL DEFAULT '',
    quality_of_life_priorities TEXT NOT NULL DEFAULT '',
    religious_beliefs TEXT NOT NULL DEFAULT '',
    spiritual_needs TEXT NOT NULL DEFAULT '',
    cultural_considerations TEXT NOT NULL DEFAULT '',
    fears_and_concerns TEXT NOT NULL DEFAULT '',
    things_that_matter_most TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_values_beliefs_updated_at
    BEFORE UPDATE ON assessment_values_beliefs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_values_beliefs IS
    'Values and beliefs section: personal, spiritual, cultural, and religious values that should guide care decisions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_values_beliefs.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_values_beliefs.personal_values IS
    'Description of personal values that are important to the person.';
COMMENT ON COLUMN assessment_values_beliefs.quality_of_life_priorities IS
    'What the person considers most important for quality of life.';
COMMENT ON COLUMN assessment_values_beliefs.religious_beliefs IS
    'Religious beliefs that may affect care preferences.';
COMMENT ON COLUMN assessment_values_beliefs.spiritual_needs IS
    'Spiritual needs the person wishes to have met.';
COMMENT ON COLUMN assessment_values_beliefs.cultural_considerations IS
    'Cultural considerations relevant to care delivery.';
COMMENT ON COLUMN assessment_values_beliefs.fears_and_concerns IS
    'Specific fears or concerns about future care.';
COMMENT ON COLUMN assessment_values_beliefs.things_that_matter_most IS
    'What matters most to the person in terms of day-to-day life.';
