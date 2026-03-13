-- 05_assessment_ipss_questionnaire.sql
-- IPSS questionnaire section of the urology assessment (7 symptom questions).

CREATE TABLE assessment_ipss_questionnaire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- IPSS Q1: Incomplete emptying
    ipss_q1_incomplete_emptying INTEGER
        CHECK (ipss_q1_incomplete_emptying IS NULL OR (ipss_q1_incomplete_emptying >= 0 AND ipss_q1_incomplete_emptying <= 5)),

    -- IPSS Q2: Frequency
    ipss_q2_frequency INTEGER
        CHECK (ipss_q2_frequency IS NULL OR (ipss_q2_frequency >= 0 AND ipss_q2_frequency <= 5)),

    -- IPSS Q3: Intermittency
    ipss_q3_intermittency INTEGER
        CHECK (ipss_q3_intermittency IS NULL OR (ipss_q3_intermittency >= 0 AND ipss_q3_intermittency <= 5)),

    -- IPSS Q4: Urgency
    ipss_q4_urgency INTEGER
        CHECK (ipss_q4_urgency IS NULL OR (ipss_q4_urgency >= 0 AND ipss_q4_urgency <= 5)),

    -- IPSS Q5: Weak stream
    ipss_q5_weak_stream INTEGER
        CHECK (ipss_q5_weak_stream IS NULL OR (ipss_q5_weak_stream >= 0 AND ipss_q5_weak_stream <= 5)),

    -- IPSS Q6: Straining
    ipss_q6_straining INTEGER
        CHECK (ipss_q6_straining IS NULL OR (ipss_q6_straining >= 0 AND ipss_q6_straining <= 5)),

    -- IPSS Q7: Nocturia
    ipss_q7_nocturia INTEGER
        CHECK (ipss_q7_nocturia IS NULL OR (ipss_q7_nocturia >= 0 AND ipss_q7_nocturia <= 5)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_ipss_questionnaire_updated_at
    BEFORE UPDATE ON assessment_ipss_questionnaire
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_ipss_questionnaire IS
    'IPSS questionnaire section: 7 standardised prostate symptom questions scored 0-5 each (total 0-35). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_ipss_questionnaire.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_ipss_questionnaire.ipss_q1_incomplete_emptying IS
    'IPSS Q1: Sensation of not emptying bladder completely; 0=not at all, 1=<1 in 5 times, 2=<half the time, 3=about half, 4=>half, 5=almost always.';
COMMENT ON COLUMN assessment_ipss_questionnaire.ipss_q2_frequency IS
    'IPSS Q2: Need to urinate again <2 hours after finishing; same 0-5 scale.';
COMMENT ON COLUMN assessment_ipss_questionnaire.ipss_q3_intermittency IS
    'IPSS Q3: Stopping and starting again several times during urination; same 0-5 scale.';
COMMENT ON COLUMN assessment_ipss_questionnaire.ipss_q4_urgency IS
    'IPSS Q4: Difficulty postponing urination; same 0-5 scale.';
COMMENT ON COLUMN assessment_ipss_questionnaire.ipss_q5_weak_stream IS
    'IPSS Q5: Weak urinary stream; same 0-5 scale.';
COMMENT ON COLUMN assessment_ipss_questionnaire.ipss_q6_straining IS
    'IPSS Q6: Need to push or strain to begin urination; same 0-5 scale.';
COMMENT ON COLUMN assessment_ipss_questionnaire.ipss_q7_nocturia IS
    'IPSS Q7: Number of times getting up to urinate at night; 0=none, 1=1 time, 2=2 times, 3=3 times, 4=4 times, 5=5+ times.';
