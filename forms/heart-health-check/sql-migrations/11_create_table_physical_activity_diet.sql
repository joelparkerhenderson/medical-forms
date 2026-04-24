CREATE TABLE physical_activity_diet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    physical_activity_minutes_per_week SMALLINT
        CHECK (physical_activity_minutes_per_week IS NULL OR (physical_activity_minutes_per_week >= 0 AND physical_activity_minutes_per_week <= 5000)),
    activity_intensity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (activity_intensity IN ('light', 'moderate', 'vigorous', '')),
    fruit_veg_portions_per_day SMALLINT
        CHECK (fruit_veg_portions_per_day IS NULL OR (fruit_veg_portions_per_day >= 0 AND fruit_veg_portions_per_day <= 30)),
    diet_quality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diet_quality IN ('poor', 'fair', 'good', 'excellent', '')),
    salt_intake VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (salt_intake IN ('low', 'moderate', 'high', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_physical_activity_diet_updated_at
    BEFORE UPDATE ON physical_activity_diet
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE physical_activity_diet IS
    'Physical activity and dietary habit data.';
COMMENT ON COLUMN physical_activity_diet.physical_activity_minutes_per_week IS
    'Total minutes of physical activity per week.';
COMMENT ON COLUMN physical_activity_diet.activity_intensity IS
    'Typical exercise intensity: light, moderate, vigorous, or empty.';
COMMENT ON COLUMN physical_activity_diet.fruit_veg_portions_per_day IS
    'Number of fruit and vegetable portions consumed per day.';
COMMENT ON COLUMN physical_activity_diet.diet_quality IS
    'Self-reported overall diet quality.';
COMMENT ON COLUMN physical_activity_diet.salt_intake IS
    'Self-reported salt intake level.';

COMMENT ON COLUMN physical_activity_diet.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN physical_activity_diet.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN physical_activity_diet.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN physical_activity_diet.updated_at IS
    'Timestamp when this row was last updated.';
