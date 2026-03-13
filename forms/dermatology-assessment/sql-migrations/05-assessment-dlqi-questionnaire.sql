-- 05_assessment_dlqi_questionnaire.sql
-- Step 3: DLQI (Dermatology Life Quality Index) questionnaire section.

CREATE TABLE assessment_dlqi_questionnaire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- DLQI Q1: How itchy, sore, painful, or stinging has your skin been?
    q1_symptoms INTEGER
        CHECK (q1_symptoms IS NULL OR q1_symptoms BETWEEN 0 AND 3),
    -- DLQI Q2: How embarrassed or self-conscious have you been?
    q2_embarrassment INTEGER
        CHECK (q2_embarrassment IS NULL OR q2_embarrassment BETWEEN 0 AND 3),
    -- DLQI Q3: How much has your skin interfered with shopping, housework, or gardening?
    q3_daily_activities INTEGER
        CHECK (q3_daily_activities IS NULL OR q3_daily_activities BETWEEN 0 AND 3),
    -- DLQI Q4: How much has your skin influenced the clothes you wear?
    q4_clothing INTEGER
        CHECK (q4_clothing IS NULL OR q4_clothing BETWEEN 0 AND 3),
    -- DLQI Q5: How much has your skin affected social or leisure activities?
    q5_social_leisure INTEGER
        CHECK (q5_social_leisure IS NULL OR q5_social_leisure BETWEEN 0 AND 3),
    -- DLQI Q6: How much has your skin made it difficult to do any sport?
    q6_sport INTEGER
        CHECK (q6_sport IS NULL OR q6_sport BETWEEN 0 AND 3),
    -- DLQI Q7: Has your skin prevented you from working or studying?
    q7_work_study INTEGER
        CHECK (q7_work_study IS NULL OR q7_work_study BETWEEN 0 AND 3),
    -- DLQI Q8: How much has your skin created problems with partner, close friends, or relatives?
    q8_relationships INTEGER
        CHECK (q8_relationships IS NULL OR q8_relationships BETWEEN 0 AND 3),
    -- DLQI Q9: How much has your skin caused any sexual difficulties?
    q9_sexual INTEGER
        CHECK (q9_sexual IS NULL OR q9_sexual BETWEEN 0 AND 3),
    -- DLQI Q10: How much of a problem has the treatment for your skin been?
    q10_treatment INTEGER
        CHECK (q10_treatment IS NULL OR q10_treatment BETWEEN 0 AND 3),

    dlqi_total INTEGER
        CHECK (dlqi_total IS NULL OR dlqi_total BETWEEN 0 AND 30),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_dlqi_questionnaire_updated_at
    BEFORE UPDATE ON assessment_dlqi_questionnaire
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_dlqi_questionnaire IS
    'Step 3 DLQI Questionnaire: 10-item Dermatology Life Quality Index (range 0-30). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_dlqi_questionnaire.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q1_symptoms IS
    'DLQI Q1: Skin itchiness, soreness, pain, or stinging (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q2_embarrassment IS
    'DLQI Q2: Embarrassment or self-consciousness (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q3_daily_activities IS
    'DLQI Q3: Interference with shopping, housework, or gardening (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q4_clothing IS
    'DLQI Q4: Influence on clothing choice (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q5_social_leisure IS
    'DLQI Q5: Effect on social or leisure activities (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q6_sport IS
    'DLQI Q6: Difficulty doing sport (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q7_work_study IS
    'DLQI Q7: Prevention from working or studying (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q8_relationships IS
    'DLQI Q8: Problems with partner, friends, or relatives (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q9_sexual IS
    'DLQI Q9: Sexual difficulties (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.q10_treatment IS
    'DLQI Q10: Treatment burden (0=not at all, 3=very much).';
COMMENT ON COLUMN assessment_dlqi_questionnaire.dlqi_total IS
    'Total DLQI score (sum of Q1-Q10), range 0-30.';
