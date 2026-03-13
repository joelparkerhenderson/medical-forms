-- ============================================================
-- 08_assessment_self_care_lifestyle.sql
-- Self-care & lifestyle section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_self_care_lifestyle (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    diet_adherence          INTEGER CHECK (diet_adherence IS NULL OR (diet_adherence >= 1 AND diet_adherence <= 5)),
    carb_counting           TEXT NOT NULL DEFAULT ''
                            CHECK (carb_counting IN ('yes', 'no', '')),
    physical_activity       TEXT NOT NULL DEFAULT ''
                            CHECK (physical_activity IN ('sedentary', 'minimal', 'moderate', 'regular', 'veryActive', '')),
    bmi                     NUMERIC(4,1) CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 80)),
    weight_change           TEXT NOT NULL DEFAULT ''
                            CHECK (weight_change IN ('stable', 'gained', 'lost', 'significantGain', 'significantLoss', '')),
    alcohol_consumption     TEXT NOT NULL DEFAULT ''
                            CHECK (alcohol_consumption IN ('none', 'withinLimits', 'aboveLimits', 'excessive', '')),
    smoking_cessation       TEXT NOT NULL DEFAULT ''
                            CHECK (smoking_cessation IN ('notApplicable', 'offered', 'declined', 'ongoing', '')),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_self_care_lifestyle_updated_at
    BEFORE UPDATE ON assessment_self_care_lifestyle
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_self_care_lifestyle IS
    '1:1 with assessment. Diet, exercise, and self-management behaviours.';
COMMENT ON COLUMN assessment_self_care_lifestyle.diet_adherence IS
    'Self-reported dietary adherence (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN assessment_self_care_lifestyle.physical_activity IS
    'Physical activity level: sedentary, minimal, moderate, regular, veryActive, or empty.';
COMMENT ON COLUMN assessment_self_care_lifestyle.bmi IS
    'Body Mass Index in kg/m2. NULL if not recorded.';
COMMENT ON COLUMN assessment_self_care_lifestyle.weight_change IS
    'Recent weight change pattern. Empty string if unanswered.';
