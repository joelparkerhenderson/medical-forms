-- 11_assessment_continence_and_skin.sql
-- Continence and skin section of the gerontology assessment.

CREATE TABLE assessment_continence_and_skin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    urinary_incontinence VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urinary_incontinence IN ('yes', 'no', '')),
    urinary_incontinence_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (urinary_incontinence_type IN ('stress', 'urge', 'mixed', 'overflow', 'functional', '')),
    urinary_frequency VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (urinary_frequency IN ('normal', 'increased', 'decreased', '')),
    nocturia INTEGER
        CHECK (nocturia IS NULL OR (nocturia >= 0 AND nocturia <= 20)),
    catheter_in_situ VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (catheter_in_situ IN ('yes', 'no', '')),
    faecal_incontinence VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (faecal_incontinence IN ('yes', 'no', '')),
    constipation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (constipation IN ('yes', 'no', '')),
    bowel_pattern VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bowel_pattern IN ('regular', 'irregular', 'diarrhoea', 'constipated', '')),
    skin_integrity VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (skin_integrity IN ('intact', 'impaired', '')),
    pressure_ulcer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pressure_ulcer IN ('yes', 'no', '')),
    pressure_ulcer_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pressure_ulcer_grade IN ('1', '2', '3', '4', '')),
    pressure_ulcer_location VARCHAR(255) NOT NULL DEFAULT '',
    waterlow_score INTEGER
        CHECK (waterlow_score IS NULL OR waterlow_score >= 0),
    skin_tears VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (skin_tears IN ('yes', 'no', '')),
    leg_ulcers VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (leg_ulcers IN ('yes', 'no', '')),
    moisture_associated_skin_damage VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (moisture_associated_skin_damage IN ('yes', 'no', '')),
    continence_skin_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_continence_and_skin_updated_at
    BEFORE UPDATE ON assessment_continence_and_skin
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_continence_and_skin IS
    'Continence and skin section: urinary and faecal continence, skin integrity, pressure ulcers, and Waterlow score. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_continence_and_skin.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_continence_and_skin.urinary_incontinence IS
    'Whether urinary incontinence is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.urinary_incontinence_type IS
    'Type of urinary incontinence: stress, urge, mixed, overflow, functional, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.urinary_frequency IS
    'Urinary frequency: normal, increased, decreased, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.nocturia IS
    'Number of times the patient wakes to urinate at night, NULL if unanswered.';
COMMENT ON COLUMN assessment_continence_and_skin.catheter_in_situ IS
    'Whether a urinary catheter is in situ: yes, no, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.faecal_incontinence IS
    'Whether faecal incontinence is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.constipation IS
    'Whether constipation is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.bowel_pattern IS
    'Bowel pattern: regular, irregular, diarrhoea, constipated, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.skin_integrity IS
    'Overall skin integrity: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.pressure_ulcer IS
    'Whether pressure ulcers are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.pressure_ulcer_grade IS
    'Pressure ulcer grade: 1, 2, 3, 4, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.pressure_ulcer_location IS
    'Location of pressure ulcers (e.g. sacrum, heel).';
COMMENT ON COLUMN assessment_continence_and_skin.waterlow_score IS
    'Waterlow pressure ulcer risk score, NULL if not assessed.';
COMMENT ON COLUMN assessment_continence_and_skin.skin_tears IS
    'Whether skin tears are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.leg_ulcers IS
    'Whether leg ulcers are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.moisture_associated_skin_damage IS
    'Whether moisture-associated skin damage is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_continence_and_skin.continence_skin_notes IS
    'Free-text notes on continence and skin assessment.';
