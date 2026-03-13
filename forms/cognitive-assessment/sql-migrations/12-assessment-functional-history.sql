-- 12_assessment_functional_history.sql
-- Functional history section of the cognitive assessment.

CREATE TABLE assessment_functional_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    managing_finances VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (managing_finances IN ('independent', 'needs-help', 'unable', '')),
    managing_medications VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (managing_medications IN ('independent', 'needs-help', 'unable', '')),
    using_telephone VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (using_telephone IN ('independent', 'needs-help', 'unable', '')),
    meal_preparation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (meal_preparation IN ('independent', 'needs-help', 'unable', '')),
    shopping VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (shopping IN ('independent', 'needs-help', 'unable', '')),
    housekeeping VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (housekeeping IN ('independent', 'needs-help', 'unable', '')),
    transportation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (transportation IN ('independent', 'needs-help', 'unable', '')),
    personal_care VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (personal_care IN ('independent', 'needs-help', 'unable', '')),
    driving_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_status IN ('driving', 'not-driving', 'dvla-notified', 'licence-revoked', '')),
    safety_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safety_concerns IN ('yes', 'no', '')),
    safety_concern_details TEXT NOT NULL DEFAULT '',
    wandering_risk VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wandering_risk IN ('yes', 'no', '')),
    carer_name VARCHAR(255) NOT NULL DEFAULT '',
    carer_relationship VARCHAR(50) NOT NULL DEFAULT '',
    carer_strain VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (carer_strain IN ('none', 'mild', 'moderate', 'severe', '')),
    functional_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_history_updated_at
    BEFORE UPDATE ON assessment_functional_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_history IS
    'Functional history section: instrumental activities of daily living, driving, safety, and carer assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_history.managing_finances IS
    'Ability to manage finances: independent, needs-help, unable, or empty.';
COMMENT ON COLUMN assessment_functional_history.managing_medications IS
    'Ability to manage medications: independent, needs-help, unable, or empty.';
COMMENT ON COLUMN assessment_functional_history.using_telephone IS
    'Ability to use a telephone: independent, needs-help, unable, or empty.';
COMMENT ON COLUMN assessment_functional_history.meal_preparation IS
    'Ability to prepare meals: independent, needs-help, unable, or empty.';
COMMENT ON COLUMN assessment_functional_history.shopping IS
    'Ability to shop: independent, needs-help, unable, or empty.';
COMMENT ON COLUMN assessment_functional_history.housekeeping IS
    'Ability to do housekeeping: independent, needs-help, unable, or empty.';
COMMENT ON COLUMN assessment_functional_history.transportation IS
    'Ability to manage transportation: independent, needs-help, unable, or empty.';
COMMENT ON COLUMN assessment_functional_history.personal_care IS
    'Ability to manage personal care: independent, needs-help, unable, or empty.';
COMMENT ON COLUMN assessment_functional_history.driving_status IS
    'Driving status: driving, not-driving, dvla-notified, licence-revoked, or empty.';
COMMENT ON COLUMN assessment_functional_history.safety_concerns IS
    'Whether there are safety concerns at home: yes, no, or empty.';
COMMENT ON COLUMN assessment_functional_history.safety_concern_details IS
    'Details of safety concerns.';
COMMENT ON COLUMN assessment_functional_history.wandering_risk IS
    'Whether the patient is at risk of wandering: yes, no, or empty.';
COMMENT ON COLUMN assessment_functional_history.carer_name IS
    'Name of the primary carer.';
COMMENT ON COLUMN assessment_functional_history.carer_relationship IS
    'Relationship of the carer to the patient.';
COMMENT ON COLUMN assessment_functional_history.carer_strain IS
    'Level of carer strain or burden: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_functional_history.functional_history_notes IS
    'Additional clinician notes on functional history.';
