-- 06_assessment_mandatory_training.sql
-- Mandatory training section of the onboarding assessment.

CREATE TABLE assessment_mandatory_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    fire_safety_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fire_safety_completed IN ('yes', 'no', '')),
    fire_safety_date DATE,
    manual_handling_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (manual_handling_completed IN ('yes', 'no', '')),
    manual_handling_date DATE,
    infection_control_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (infection_control_completed IN ('yes', 'no', '')),
    infection_control_date DATE,
    safeguarding_adults_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safeguarding_adults_completed IN ('yes', 'no', '')),
    safeguarding_adults_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (safeguarding_adults_level IN ('level-1', 'level-2', 'level-3', '')),
    safeguarding_children_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safeguarding_children_completed IN ('yes', 'no', '')),
    safeguarding_children_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (safeguarding_children_level IN ('level-1', 'level-2', 'level-3', '')),
    information_governance_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (information_governance_completed IN ('yes', 'no', '')),
    information_governance_date DATE,
    basic_life_support_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (basic_life_support_completed IN ('yes', 'no', '')),
    basic_life_support_date DATE,
    equality_diversity_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (equality_diversity_completed IN ('yes', 'no', '')),
    health_safety_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (health_safety_completed IN ('yes', 'no', '')),
    conflict_resolution_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (conflict_resolution_completed IN ('yes', 'no', '')),
    mandatory_training_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mandatory_training_updated_at
    BEFORE UPDATE ON assessment_mandatory_training
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mandatory_training IS
    'Mandatory training section: statutory and mandatory training modules required for all healthcare staff. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mandatory_training.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mandatory_training.fire_safety_completed IS
    'Whether fire safety training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.fire_safety_date IS
    'Date fire safety training was completed.';
COMMENT ON COLUMN assessment_mandatory_training.manual_handling_completed IS
    'Whether manual handling training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.manual_handling_date IS
    'Date manual handling training was completed.';
COMMENT ON COLUMN assessment_mandatory_training.infection_control_completed IS
    'Whether infection control training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.infection_control_date IS
    'Date infection control training was completed.';
COMMENT ON COLUMN assessment_mandatory_training.safeguarding_adults_completed IS
    'Whether safeguarding adults training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.safeguarding_adults_level IS
    'Safeguarding adults training level: level-1, level-2, level-3, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.safeguarding_children_completed IS
    'Whether safeguarding children training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.safeguarding_children_level IS
    'Safeguarding children training level: level-1, level-2, level-3, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.information_governance_completed IS
    'Whether information governance training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.information_governance_date IS
    'Date information governance training was completed.';
COMMENT ON COLUMN assessment_mandatory_training.basic_life_support_completed IS
    'Whether basic life support training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.basic_life_support_date IS
    'Date basic life support training was completed.';
COMMENT ON COLUMN assessment_mandatory_training.equality_diversity_completed IS
    'Whether equality and diversity training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.health_safety_completed IS
    'Whether health and safety training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.conflict_resolution_completed IS
    'Whether conflict resolution training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_mandatory_training.mandatory_training_notes IS
    'Additional notes on mandatory training.';
