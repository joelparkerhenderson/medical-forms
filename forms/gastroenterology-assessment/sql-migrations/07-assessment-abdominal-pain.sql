-- 07_assessment_abdominal_pain.sql
-- Step 5: Abdominal pain assessment section.

CREATE TABLE assessment_abdominal_pain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_abdominal_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_abdominal_pain IN ('yes', 'no', '')),
    pain_location VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (pain_location IN ('epigastric', 'right_upper_quadrant', 'left_upper_quadrant', 'periumbilical', 'right_lower_quadrant', 'left_lower_quadrant', 'suprapubic', 'diffuse', 'right_flank', 'left_flank', '')),
    pain_character VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pain_character IN ('cramping', 'burning', 'sharp', 'dull', 'colicky', 'constant', '')),
    pain_severity INTEGER
        CHECK (pain_severity IS NULL OR (pain_severity >= 0 AND pain_severity <= 10)),
    pain_radiation TEXT NOT NULL DEFAULT '',
    pain_onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pain_onset IN ('sudden', 'gradual', '')),
    pain_duration VARCHAR(30) NOT NULL DEFAULT '',
    pain_aggravating_factors TEXT NOT NULL DEFAULT '',
    pain_relieving_factors TEXT NOT NULL DEFAULT '',
    relation_to_meals VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (relation_to_meals IN ('worse_with_food', 'better_with_food', 'no_relation', '')),
    relation_to_defecation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (relation_to_defecation IN ('better_after', 'worse_after', 'no_relation', '')),
    nocturnal_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nocturnal_pain IN ('yes', 'no', '')),
    associated_weight_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (associated_weight_loss IN ('yes', 'no', '')),
    weight_loss_amount_kg NUMERIC(4,1)
        CHECK (weight_loss_amount_kg IS NULL OR weight_loss_amount_kg >= 0),
    weight_loss_duration VARCHAR(30) NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_abdominal_pain_updated_at
    BEFORE UPDATE ON assessment_abdominal_pain
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_abdominal_pain IS
    'Step 5 Abdominal Pain Assessment: location, character, and associated features of abdominal pain. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_abdominal_pain.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_abdominal_pain.has_abdominal_pain IS
    'Whether the patient has abdominal pain.';
COMMENT ON COLUMN assessment_abdominal_pain.pain_location IS
    'Anatomical location of abdominal pain.';
COMMENT ON COLUMN assessment_abdominal_pain.pain_character IS
    'Character of the pain.';
COMMENT ON COLUMN assessment_abdominal_pain.pain_severity IS
    'Pain severity on a 0-10 numerical rating scale.';
COMMENT ON COLUMN assessment_abdominal_pain.pain_radiation IS
    'Where the pain radiates to (e.g. back, shoulder).';
COMMENT ON COLUMN assessment_abdominal_pain.pain_onset IS
    'Whether the onset was sudden or gradual.';
COMMENT ON COLUMN assessment_abdominal_pain.pain_duration IS
    'Duration of pain episodes.';
COMMENT ON COLUMN assessment_abdominal_pain.pain_aggravating_factors IS
    'Factors that worsen the pain.';
COMMENT ON COLUMN assessment_abdominal_pain.pain_relieving_factors IS
    'Factors that relieve the pain.';
COMMENT ON COLUMN assessment_abdominal_pain.relation_to_meals IS
    'Relationship of pain to food intake.';
COMMENT ON COLUMN assessment_abdominal_pain.relation_to_defecation IS
    'Relationship of pain to bowel movements (relevant to IBS diagnosis).';
COMMENT ON COLUMN assessment_abdominal_pain.nocturnal_pain IS
    'Whether pain wakes the patient at night (red flag symptom).';
COMMENT ON COLUMN assessment_abdominal_pain.associated_weight_loss IS
    'Whether there is associated unintentional weight loss (red flag symptom).';
COMMENT ON COLUMN assessment_abdominal_pain.weight_loss_amount_kg IS
    'Amount of unintentional weight loss in kilograms.';
COMMENT ON COLUMN assessment_abdominal_pain.weight_loss_duration IS
    'Duration over which weight loss occurred.';
COMMENT ON COLUMN assessment_abdominal_pain.additional_notes IS
    'Additional notes about abdominal pain.';
