-- 05_assessment_mrs_symptom_scale.sql
-- Menopause Rating Scale (MRS) symptom scale section of the HRT assessment.

CREATE TABLE assessment_mrs_symptom_scale (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- MRS 11 items, each scored 0 (none) to 4 (very severe)
    -- Somatic subscale (items 1-3, 11)
    hot_flushes_sweating INTEGER
        CHECK (hot_flushes_sweating IS NULL OR (hot_flushes_sweating >= 0 AND hot_flushes_sweating <= 4)),
    heart_discomfort INTEGER
        CHECK (heart_discomfort IS NULL OR (heart_discomfort >= 0 AND heart_discomfort <= 4)),
    sleep_problems INTEGER
        CHECK (sleep_problems IS NULL OR (sleep_problems >= 0 AND sleep_problems <= 4)),
    joint_muscle_discomfort INTEGER
        CHECK (joint_muscle_discomfort IS NULL OR (joint_muscle_discomfort >= 0 AND joint_muscle_discomfort <= 4)),

    -- Psychological subscale (items 4-7)
    depressive_mood INTEGER
        CHECK (depressive_mood IS NULL OR (depressive_mood >= 0 AND depressive_mood <= 4)),
    irritability INTEGER
        CHECK (irritability IS NULL OR (irritability >= 0 AND irritability <= 4)),
    anxiety INTEGER
        CHECK (anxiety IS NULL OR (anxiety >= 0 AND anxiety <= 4)),
    physical_mental_exhaustion INTEGER
        CHECK (physical_mental_exhaustion IS NULL OR (physical_mental_exhaustion >= 0 AND physical_mental_exhaustion <= 4)),

    -- Urogenital subscale (items 8-10)
    sexual_problems INTEGER
        CHECK (sexual_problems IS NULL OR (sexual_problems >= 0 AND sexual_problems <= 4)),
    bladder_problems INTEGER
        CHECK (bladder_problems IS NULL OR (bladder_problems >= 0 AND bladder_problems <= 4)),
    dryness_of_vagina INTEGER
        CHECK (dryness_of_vagina IS NULL OR (dryness_of_vagina >= 0 AND dryness_of_vagina <= 4)),

    -- Computed subscale and total scores
    somatic_subscale_score INTEGER
        CHECK (somatic_subscale_score IS NULL OR (somatic_subscale_score >= 0 AND somatic_subscale_score <= 16)),
    psychological_subscale_score INTEGER
        CHECK (psychological_subscale_score IS NULL OR (psychological_subscale_score >= 0 AND psychological_subscale_score <= 16)),
    urogenital_subscale_score INTEGER
        CHECK (urogenital_subscale_score IS NULL OR (urogenital_subscale_score >= 0 AND urogenital_subscale_score <= 12)),
    mrs_total_score INTEGER
        CHECK (mrs_total_score IS NULL OR (mrs_total_score >= 0 AND mrs_total_score <= 44)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mrs_symptom_scale_updated_at
    BEFORE UPDATE ON assessment_mrs_symptom_scale
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mrs_symptom_scale IS
    'Menopause Rating Scale: 11 items scored 0-4 across somatic, psychological, and urogenital subscales. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mrs_symptom_scale.hot_flushes_sweating IS
    'MRS item 1 (somatic): Hot flushes and sweating. 0=None, 1=Mild, 2=Moderate, 3=Severe, 4=Very severe.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.heart_discomfort IS
    'MRS item 2 (somatic): Heart discomfort (palpitations, tightness). 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.sleep_problems IS
    'MRS item 3 (somatic): Sleep problems (difficulty falling asleep, waking early). 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.joint_muscle_discomfort IS
    'MRS item 11 (somatic): Joint and muscular discomfort. 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.depressive_mood IS
    'MRS item 4 (psychological): Depressive mood. 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.irritability IS
    'MRS item 5 (psychological): Irritability. 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.anxiety IS
    'MRS item 6 (psychological): Anxiety. 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.physical_mental_exhaustion IS
    'MRS item 7 (psychological): Physical and mental exhaustion. 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.sexual_problems IS
    'MRS item 8 (urogenital): Sexual problems (change in desire, activity, satisfaction). 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.bladder_problems IS
    'MRS item 9 (urogenital): Bladder problems (difficulty urinating, incontinence). 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.dryness_of_vagina IS
    'MRS item 10 (urogenital): Dryness of vagina (burning, difficulty with intercourse). 0-4 severity.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.somatic_subscale_score IS
    'Somatic subscale total (items 1-3, 11), range 0-16.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.psychological_subscale_score IS
    'Psychological subscale total (items 4-7), range 0-16.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.urogenital_subscale_score IS
    'Urogenital subscale total (items 8-10), range 0-12.';
COMMENT ON COLUMN assessment_mrs_symptom_scale.mrs_total_score IS
    'MRS total score (all 11 items), range 0-44.';
