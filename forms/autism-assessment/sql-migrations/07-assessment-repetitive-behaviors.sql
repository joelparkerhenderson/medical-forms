-- 07_assessment_repetitive_behaviors.sql
-- Repetitive behaviors section of the autism assessment.

CREATE TABLE assessment_repetitive_behaviors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    repetitive_movements VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (repetitive_movements IN ('never', 'sometimes', 'often', 'always', '')),
    repetitive_movement_details TEXT NOT NULL DEFAULT '',
    insistence_on_sameness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (insistence_on_sameness IN ('never', 'sometimes', 'often', 'always', '')),
    distress_with_change VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (distress_with_change IN ('never', 'sometimes', 'often', 'always', '')),
    rigid_routines VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (rigid_routines IN ('never', 'sometimes', 'often', 'always', '')),
    rigid_routine_details TEXT NOT NULL DEFAULT '',
    special_interests VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (special_interests IN ('yes', 'no', '')),
    special_interest_details TEXT NOT NULL DEFAULT '',
    special_interest_intensity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (special_interest_intensity IN ('mild', 'moderate', 'intense', 'all-consuming', '')),
    echolalia VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (echolalia IN ('never', 'sometimes', 'often', 'always', '')),
    repetitive_behaviors_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_repetitive_behaviors_updated_at
    BEFORE UPDATE ON assessment_repetitive_behaviors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_repetitive_behaviors IS
    'Repetitive behaviors section: stereotyped movements, insistence on sameness, rigid routines, and special interests. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_repetitive_behaviors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_repetitive_behaviors.repetitive_movements IS
    'Frequency of repetitive motor movements (e.g. hand-flapping, rocking).';
COMMENT ON COLUMN assessment_repetitive_behaviors.repetitive_movement_details IS
    'Description of specific repetitive movements observed.';
COMMENT ON COLUMN assessment_repetitive_behaviors.insistence_on_sameness IS
    'Frequency of insistence on things staying the same.';
COMMENT ON COLUMN assessment_repetitive_behaviors.distress_with_change IS
    'Frequency of distress when routines or environments change.';
COMMENT ON COLUMN assessment_repetitive_behaviors.rigid_routines IS
    'Frequency of adherence to rigid or ritualistic routines.';
COMMENT ON COLUMN assessment_repetitive_behaviors.rigid_routine_details IS
    'Description of specific rigid routines.';
COMMENT ON COLUMN assessment_repetitive_behaviors.special_interests IS
    'Whether the patient has intense or focused special interests: yes, no, or empty.';
COMMENT ON COLUMN assessment_repetitive_behaviors.special_interest_details IS
    'Description of special interests.';
COMMENT ON COLUMN assessment_repetitive_behaviors.special_interest_intensity IS
    'Intensity of special interests: mild, moderate, intense, all-consuming, or empty.';
COMMENT ON COLUMN assessment_repetitive_behaviors.echolalia IS
    'Frequency of echolalia (repeating words or phrases).';
COMMENT ON COLUMN assessment_repetitive_behaviors.repetitive_behaviors_notes IS
    'Additional clinician or patient notes on repetitive behaviors.';
