-- 07_assessment_trigger_identification.sql
-- Trigger identification section of the sundowner syndrome assessment.

CREATE TABLE assessment_trigger_identification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    pain_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_trigger IN ('yes', 'no', '')),
    pain_details TEXT NOT NULL DEFAULT '',
    hunger_thirst_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hunger_thirst_trigger IN ('yes', 'no', '')),
    toileting_needs_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (toileting_needs_trigger IN ('yes', 'no', '')),
    fatigue_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fatigue_trigger IN ('yes', 'no', '')),
    overstimulation_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (overstimulation_trigger IN ('yes', 'no', '')),
    understimulation_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (understimulation_trigger IN ('yes', 'no', '')),
    unfamiliar_environment_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (unfamiliar_environment_trigger IN ('yes', 'no', '')),
    carer_change_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_change_trigger IN ('yes', 'no', '')),
    routine_disruption_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (routine_disruption_trigger IN ('yes', 'no', '')),
    infection_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (infection_trigger IN ('yes', 'no', '')),
    infection_details TEXT NOT NULL DEFAULT '',
    constipation_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (constipation_trigger IN ('yes', 'no', '')),
    dehydration_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dehydration_trigger IN ('yes', 'no', '')),
    medication_change_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (medication_change_trigger IN ('yes', 'no', '')),
    other_triggers TEXT NOT NULL DEFAULT '',
    trigger_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_trigger_identification_updated_at
    BEFORE UPDATE ON assessment_trigger_identification
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_trigger_identification IS
    'Trigger identification section: physical, environmental, and situational triggers for sundowning episodes. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_trigger_identification.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_trigger_identification.pain_trigger IS
    'Whether pain is an identified trigger: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.pain_details IS
    'Details of pain that triggers episodes.';
COMMENT ON COLUMN assessment_trigger_identification.hunger_thirst_trigger IS
    'Whether hunger or thirst triggers episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.toileting_needs_trigger IS
    'Whether unmet toileting needs trigger episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.fatigue_trigger IS
    'Whether fatigue triggers episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.overstimulation_trigger IS
    'Whether overstimulation triggers episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.understimulation_trigger IS
    'Whether understimulation or boredom triggers episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.unfamiliar_environment_trigger IS
    'Whether unfamiliar environments trigger episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.carer_change_trigger IS
    'Whether changes in carer trigger episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.routine_disruption_trigger IS
    'Whether disruption to routine triggers episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.infection_trigger IS
    'Whether underlying infection (e.g. UTI) triggers episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.infection_details IS
    'Details of infection-related triggers.';
COMMENT ON COLUMN assessment_trigger_identification.constipation_trigger IS
    'Whether constipation triggers episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.dehydration_trigger IS
    'Whether dehydration triggers episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.medication_change_trigger IS
    'Whether recent medication changes triggered episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_trigger_identification.other_triggers IS
    'Free-text list of other identified triggers.';
COMMENT ON COLUMN assessment_trigger_identification.trigger_notes IS
    'Additional clinician notes on trigger identification.';
