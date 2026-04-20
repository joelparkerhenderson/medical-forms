-- 11_assessment_current_nutritional_support.sql
-- Current nutritional support section of the nutrition assessment.

CREATE TABLE assessment_current_nutritional_support (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    oral_diet VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oral_diet IN ('yes', 'no', '')),
    oral_nutritional_supplements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oral_nutritional_supplements IN ('yes', 'no', '')),
    ons_type TEXT NOT NULL DEFAULT '',
    ons_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ons_frequency IN ('once-daily', 'twice-daily', 'three-times-daily', 'as-needed', '')),
    enteral_feeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (enteral_feeding IN ('yes', 'no', '')),
    enteral_route VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (enteral_route IN ('nasogastric', 'nasojejunal', 'peg', 'pej', 'rig', 'other', '')),
    enteral_feed_type TEXT NOT NULL DEFAULT '',
    enteral_rate_ml_per_hour INTEGER
        CHECK (enteral_rate_ml_per_hour IS NULL OR enteral_rate_ml_per_hour > 0),
    enteral_hours_per_day INTEGER
        CHECK (enteral_hours_per_day IS NULL OR (enteral_hours_per_day >= 0 AND enteral_hours_per_day <= 24)),
    parenteral_nutrition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (parenteral_nutrition IN ('yes', 'no', '')),
    parenteral_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (parenteral_type IN ('peripheral', 'central', '')),
    parenteral_details TEXT NOT NULL DEFAULT '',
    food_fortification VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (food_fortification IN ('yes', 'no', '')),
    nutritional_support_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_nutritional_support_updated_at
    BEFORE UPDATE ON assessment_current_nutritional_support
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_nutritional_support IS
    'Current nutritional support section: oral diet, supplements, enteral feeding, parenteral nutrition. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_nutritional_support.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_nutritional_support.oral_diet IS
    'Whether the patient is taking an oral diet: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_nutritional_support.oral_nutritional_supplements IS
    'Whether oral nutritional supplements (ONS) are prescribed: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_nutritional_support.ons_type IS
    'Type or brand of oral nutritional supplement.';
COMMENT ON COLUMN assessment_current_nutritional_support.ons_frequency IS
    'Frequency of ONS: once-daily, twice-daily, three-times-daily, as-needed, or empty.';
COMMENT ON COLUMN assessment_current_nutritional_support.enteral_feeding IS
    'Whether enteral (tube) feeding is in place: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_nutritional_support.enteral_route IS
    'Route of enteral feeding: nasogastric, nasojejunal, peg, pej, rig, other, or empty.';
COMMENT ON COLUMN assessment_current_nutritional_support.enteral_feed_type IS
    'Type or brand of enteral feed.';
COMMENT ON COLUMN assessment_current_nutritional_support.enteral_rate_ml_per_hour IS
    'Enteral feed rate in millilitres per hour.';
COMMENT ON COLUMN assessment_current_nutritional_support.enteral_hours_per_day IS
    'Number of hours per day the enteral feed runs.';
COMMENT ON COLUMN assessment_current_nutritional_support.parenteral_nutrition IS
    'Whether parenteral nutrition (PN) is in place: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_nutritional_support.parenteral_type IS
    'Type of parenteral nutrition: peripheral or central, or empty.';
COMMENT ON COLUMN assessment_current_nutritional_support.parenteral_details IS
    'Details of parenteral nutrition regimen.';
COMMENT ON COLUMN assessment_current_nutritional_support.food_fortification IS
    'Whether food fortification strategies are in use: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_nutritional_support.nutritional_support_notes IS
    'Additional clinician notes on current nutritional support.';
