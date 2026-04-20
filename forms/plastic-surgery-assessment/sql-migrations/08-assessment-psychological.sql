-- 08_assessment_psychological.sql
-- Psychological assessment section of the plastic surgery assessment.

CREATE TABLE assessment_psychological (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    body_dysmorphic_concern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (body_dysmorphic_concern IN ('yes', 'no', '')),
    body_dysmorphic_details TEXT NOT NULL DEFAULT '',
    realistic_expectations VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (realistic_expectations IN ('yes', 'partly', 'no', '')),
    expectations_details TEXT NOT NULL DEFAULT '',
    motivation VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (motivation IN ('functional-improvement', 'cosmetic-improvement', 'pain-relief', 'cancer-treatment', 'trauma-repair', 'other', '')),
    motivation_other TEXT NOT NULL DEFAULT '',
    previous_mental_health VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_mental_health IN ('yes', 'no', '')),
    mental_health_details TEXT NOT NULL DEFAULT '',
    anxiety_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (anxiety_level IN ('none', 'mild', 'moderate', 'severe', '')),
    depression_screen VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (depression_screen IN ('yes', 'no', '')),
    social_impact VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (social_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    social_impact_details TEXT NOT NULL DEFAULT '',
    psychological_referral_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (psychological_referral_needed IN ('yes', 'no', '')),
    psychological_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_psychological_updated_at
    BEFORE UPDATE ON assessment_psychological
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychological IS
    'Psychological assessment section: body dysmorphia screening, expectations, motivation, mental health. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_psychological.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_psychological.body_dysmorphic_concern IS
    'Whether body dysmorphic disorder screening is positive: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.realistic_expectations IS
    'Whether the patient has realistic expectations: yes, partly, no, or empty.';
COMMENT ON COLUMN assessment_psychological.motivation IS
    'Primary motivation for surgery: functional-improvement, cosmetic-improvement, pain-relief, cancer-treatment, trauma-repair, other, or empty.';
COMMENT ON COLUMN assessment_psychological.anxiety_level IS
    'Anxiety level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_psychological.depression_screen IS
    'Whether formal depression screening is indicated: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.social_impact IS
    'Impact on social functioning: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_psychological.psychological_referral_needed IS
    'Whether psychological referral is recommended: yes, no, or empty.';
