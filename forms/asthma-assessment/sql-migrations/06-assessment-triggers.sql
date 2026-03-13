-- 06_assessment_triggers.sql
-- Asthma triggers section of the asthma assessment.

CREATE TABLE assessment_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    trigger_dust_mites VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_dust_mites IN ('yes', 'no', '')),
    trigger_pollen VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_pollen IN ('yes', 'no', '')),
    trigger_animal_dander VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_animal_dander IN ('yes', 'no', '')),
    trigger_mould VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_mould IN ('yes', 'no', '')),
    trigger_cold_air VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_cold_air IN ('yes', 'no', '')),
    trigger_exercise VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_exercise IN ('yes', 'no', '')),
    trigger_infections VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_infections IN ('yes', 'no', '')),
    trigger_tobacco_smoke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_tobacco_smoke IN ('yes', 'no', '')),
    trigger_occupational VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_occupational IN ('yes', 'no', '')),
    occupational_trigger_details TEXT NOT NULL DEFAULT '',
    trigger_stress VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_stress IN ('yes', 'no', '')),
    trigger_nsaids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trigger_nsaids IN ('yes', 'no', '')),
    other_triggers TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_triggers_updated_at
    BEFORE UPDATE ON assessment_triggers
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_triggers IS
    'Asthma triggers section: environmental, occupational, and other factors that provoke symptoms. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_triggers.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_triggers.trigger_dust_mites IS
    'Whether house dust mites trigger symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_pollen IS
    'Whether pollen triggers symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_animal_dander IS
    'Whether animal dander triggers symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_mould IS
    'Whether mould triggers symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_cold_air IS
    'Whether cold air triggers symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_exercise IS
    'Whether exercise triggers symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_infections IS
    'Whether respiratory infections trigger symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_tobacco_smoke IS
    'Whether tobacco smoke triggers symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_occupational IS
    'Whether occupational exposures trigger symptoms.';
COMMENT ON COLUMN assessment_triggers.occupational_trigger_details IS
    'Details of occupational triggers if applicable.';
COMMENT ON COLUMN assessment_triggers.trigger_stress IS
    'Whether stress or emotional factors trigger symptoms.';
COMMENT ON COLUMN assessment_triggers.trigger_nsaids IS
    'Whether NSAIDs (e.g. aspirin, ibuprofen) trigger symptoms.';
COMMENT ON COLUMN assessment_triggers.other_triggers IS
    'Free-text list of any other asthma triggers.';
