-- 04_assessment_alcohol_use_audit.sql
-- Alcohol Use Disorders Identification Test (AUDIT) section.

CREATE TABLE assessment_alcohol_use_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- AUDIT Q1: How often do you have a drink containing alcohol?
    audit_q1_frequency INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q1_frequency >= 0 AND audit_q1_frequency <= 4),
    -- AUDIT Q2: How many drinks containing alcohol do you have on a typical day when you are drinking?
    audit_q2_typical_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q2_typical_quantity >= 0 AND audit_q2_typical_quantity <= 4),
    -- AUDIT Q3: How often do you have 6 or more drinks on one occasion?
    audit_q3_binge_frequency INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q3_binge_frequency >= 0 AND audit_q3_binge_frequency <= 4),
    -- AUDIT Q4: How often during the last year have you found that you were not able to stop drinking once you had started?
    audit_q4_impaired_control INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q4_impaired_control >= 0 AND audit_q4_impaired_control <= 4),
    -- AUDIT Q5: How often during the last year have you failed to do what was normally expected of you because of drinking?
    audit_q5_failed_expectations INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q5_failed_expectations >= 0 AND audit_q5_failed_expectations <= 4),
    -- AUDIT Q6: How often during the last year have you needed a first drink in the morning to get yourself going?
    audit_q6_morning_drinking INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q6_morning_drinking >= 0 AND audit_q6_morning_drinking <= 4),
    -- AUDIT Q7: How often during the last year have you had a feeling of guilt or remorse after drinking?
    audit_q7_guilt INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q7_guilt >= 0 AND audit_q7_guilt <= 4),
    -- AUDIT Q8: How often during the last year have you been unable to remember what happened the night before because of your drinking?
    audit_q8_blackout INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q8_blackout >= 0 AND audit_q8_blackout <= 4),
    -- AUDIT Q9: Have you or someone else been injured because of your drinking?
    audit_q9_injury INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q9_injury >= 0 AND audit_q9_injury <= 4),
    -- AUDIT Q10: Has a relative, friend, doctor, or other health care worker been concerned about your drinking or suggested you cut down?
    audit_q10_concern INTEGER NOT NULL DEFAULT 0
        CHECK (audit_q10_concern >= 0 AND audit_q10_concern <= 4),

    audit_total_score INTEGER
        CHECK (audit_total_score IS NULL OR (audit_total_score >= 0 AND audit_total_score <= 40)),
    audit_risk_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (audit_risk_category IN ('low-risk', 'hazardous', 'harmful', 'dependence-likely', '')),
    alcohol_use_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_alcohol_use_audit_updated_at
    BEFORE UPDATE ON assessment_alcohol_use_audit
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_alcohol_use_audit IS
    'AUDIT (Alcohol Use Disorders Identification Test) section: 10 WHO-validated questions scoring 0-40. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_alcohol_use_audit.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q1_frequency IS
    'AUDIT Q1: Frequency of alcohol use (0=never, 1=monthly or less, 2=2-4 times/month, 3=2-3 times/week, 4=4+ times/week).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q2_typical_quantity IS
    'AUDIT Q2: Typical quantity on drinking day (0=1-2, 1=3-4, 2=5-6, 3=7-9, 4=10+).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q3_binge_frequency IS
    'AUDIT Q3: Frequency of 6+ drinks on one occasion (0=never, 1=less than monthly, 2=monthly, 3=weekly, 4=daily or almost daily).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q4_impaired_control IS
    'AUDIT Q4: Unable to stop once started (0=never, 1=less than monthly, 2=monthly, 3=weekly, 4=daily or almost daily).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q5_failed_expectations IS
    'AUDIT Q5: Failed expectations due to drinking (0=never, 1=less than monthly, 2=monthly, 3=weekly, 4=daily or almost daily).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q6_morning_drinking IS
    'AUDIT Q6: Morning drinking to get going (0=never, 1=less than monthly, 2=monthly, 3=weekly, 4=daily or almost daily).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q7_guilt IS
    'AUDIT Q7: Guilt after drinking (0=never, 1=less than monthly, 2=monthly, 3=weekly, 4=daily or almost daily).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q8_blackout IS
    'AUDIT Q8: Blackouts from drinking (0=never, 1=less than monthly, 2=monthly, 3=weekly, 4=daily or almost daily).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q9_injury IS
    'AUDIT Q9: Injury from drinking (0=no, 2=yes but not in the last year, 4=yes during the last year).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_q10_concern IS
    'AUDIT Q10: Others concerned about drinking (0=no, 2=yes but not in the last year, 4=yes during the last year).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_total_score IS
    'Computed AUDIT total score (0-40).';
COMMENT ON COLUMN assessment_alcohol_use_audit.audit_risk_category IS
    'AUDIT risk category: low-risk (0-7), hazardous (8-15), harmful (16-19), dependence-likely (20-40), or empty.';
COMMENT ON COLUMN assessment_alcohol_use_audit.alcohol_use_notes IS
    'Additional clinician notes on alcohol use.';
