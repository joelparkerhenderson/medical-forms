-- 05_assessment_drug_use_dast.sql
-- Drug Abuse Screening Test (DAST-10) section.

CREATE TABLE assessment_drug_use_dast (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- DAST Q1: Have you used drugs other than those required for medical reasons?
    dast_q1_non_medical_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q1_non_medical_use IN ('yes', 'no', '')),
    -- DAST Q2: Do you abuse more than one drug at a time?
    dast_q2_poly_drug VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q2_poly_drug IN ('yes', 'no', '')),
    -- DAST Q3: Are you always able to stop using drugs when you want to? (scored inversely)
    dast_q3_able_to_stop VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q3_able_to_stop IN ('yes', 'no', '')),
    -- DAST Q4: Have you had blackouts or flashbacks as a result of drug use?
    dast_q4_blackouts VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q4_blackouts IN ('yes', 'no', '')),
    -- DAST Q5: Do you ever feel bad or guilty about your drug use?
    dast_q5_guilt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q5_guilt IN ('yes', 'no', '')),
    -- DAST Q6: Does your spouse (or parents) ever complain about your involvement with drugs?
    dast_q6_complaints VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q6_complaints IN ('yes', 'no', '')),
    -- DAST Q7: Have you neglected your family because of your use of drugs?
    dast_q7_neglect VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q7_neglect IN ('yes', 'no', '')),
    -- DAST Q8: Have you engaged in illegal activities in order to obtain drugs?
    dast_q8_illegal_activities VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q8_illegal_activities IN ('yes', 'no', '')),
    -- DAST Q9: Have you ever experienced withdrawal symptoms when you stopped taking drugs?
    dast_q9_withdrawal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q9_withdrawal IN ('yes', 'no', '')),
    -- DAST Q10: Have you had medical problems as a result of your drug use?
    dast_q10_medical_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dast_q10_medical_problems IN ('yes', 'no', '')),

    dast_total_score INTEGER
        CHECK (dast_total_score IS NULL OR (dast_total_score >= 0 AND dast_total_score <= 10)),
    dast_risk_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dast_risk_category IN ('no-problems', 'low', 'moderate', 'substantial', 'severe', '')),
    drug_use_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_drug_use_dast_updated_at
    BEFORE UPDATE ON assessment_drug_use_dast
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_drug_use_dast IS
    'DAST-10 (Drug Abuse Screening Test) section: 10 yes/no questions scoring 0-10. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_drug_use_dast.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q1_non_medical_use IS
    'DAST Q1: Non-medical drug use: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q2_poly_drug IS
    'DAST Q2: Poly-drug abuse: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q3_able_to_stop IS
    'DAST Q3: Able to stop when wanted: yes (score 0), no (score 1), or empty. Inversely scored.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q4_blackouts IS
    'DAST Q4: Blackouts or flashbacks: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q5_guilt IS
    'DAST Q5: Guilt about drug use: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q6_complaints IS
    'DAST Q6: Family complaints about drug use: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q7_neglect IS
    'DAST Q7: Neglected family due to drugs: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q8_illegal_activities IS
    'DAST Q8: Illegal activities to obtain drugs: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q9_withdrawal IS
    'DAST Q9: Experienced withdrawal symptoms: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_q10_medical_problems IS
    'DAST Q10: Medical problems from drug use: yes (score 1), no (score 0), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.dast_total_score IS
    'Computed DAST-10 total score (0-10).';
COMMENT ON COLUMN assessment_drug_use_dast.dast_risk_category IS
    'DAST risk category: no-problems (0), low (1-2), moderate (3-5), substantial (6-8), severe (9-10), or empty.';
COMMENT ON COLUMN assessment_drug_use_dast.drug_use_notes IS
    'Additional clinician notes on drug use.';
