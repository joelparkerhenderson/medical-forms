-- 09_assessment_physical_health_impact.sql
-- Physical health impact section of the substance abuse assessment.

CREATE TABLE assessment_physical_health_impact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    liver_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (liver_disease IN ('yes', 'no', '')),
    liver_disease_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (liver_disease_type IN ('fatty-liver', 'hepatitis', 'cirrhosis', 'other', '')),
    hepatitis_b VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatitis_b IN ('yes', 'no', 'unknown', '')),
    hepatitis_c VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatitis_c IN ('yes', 'no', 'unknown', '')),
    hiv_status VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hiv_status IN ('positive', 'negative', 'unknown', '')),
    cardiovascular_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiovascular_issues IN ('yes', 'no', '')),
    cardiovascular_details TEXT NOT NULL DEFAULT '',
    respiratory_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (respiratory_issues IN ('yes', 'no', '')),
    respiratory_details TEXT NOT NULL DEFAULT '',
    gastrointestinal_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gastrointestinal_issues IN ('yes', 'no', '')),
    gastrointestinal_details TEXT NOT NULL DEFAULT '',
    neurological_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neurological_issues IN ('yes', 'no', '')),
    neurological_details TEXT NOT NULL DEFAULT '',
    nutritional_deficiency VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nutritional_deficiency IN ('yes', 'no', '')),
    chronic_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chronic_pain IN ('yes', 'no', '')),
    chronic_pain_details TEXT NOT NULL DEFAULT '',
    overdose_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (overdose_history IN ('yes', 'no', '')),
    overdose_count INTEGER
        CHECK (overdose_count IS NULL OR overdose_count >= 0),
    last_overdose_date DATE,
    physical_health_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_physical_health_impact_updated_at
    BEFORE UPDATE ON assessment_physical_health_impact
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_physical_health_impact IS
    'Physical health impact section: liver disease, blood-borne viruses, organ damage, overdose history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_physical_health_impact.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_physical_health_impact.liver_disease IS
    'Whether the patient has liver disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.liver_disease_type IS
    'Type of liver disease: fatty-liver, hepatitis, cirrhosis, other, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.hepatitis_b IS
    'Hepatitis B status: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.hepatitis_c IS
    'Hepatitis C status: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.hiv_status IS
    'HIV status: positive, negative, unknown, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.cardiovascular_issues IS
    'Whether substance use has caused cardiovascular issues: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.cardiovascular_details IS
    'Details of cardiovascular issues related to substance use.';
COMMENT ON COLUMN assessment_physical_health_impact.respiratory_issues IS
    'Whether substance use has caused respiratory issues: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.respiratory_details IS
    'Details of respiratory issues related to substance use.';
COMMENT ON COLUMN assessment_physical_health_impact.gastrointestinal_issues IS
    'Whether substance use has caused gastrointestinal issues: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.gastrointestinal_details IS
    'Details of gastrointestinal issues related to substance use.';
COMMENT ON COLUMN assessment_physical_health_impact.neurological_issues IS
    'Whether substance use has caused neurological issues: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.neurological_details IS
    'Details of neurological issues related to substance use.';
COMMENT ON COLUMN assessment_physical_health_impact.nutritional_deficiency IS
    'Whether the patient has nutritional deficiency: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.chronic_pain IS
    'Whether the patient has chronic pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.chronic_pain_details IS
    'Details of chronic pain condition.';
COMMENT ON COLUMN assessment_physical_health_impact.overdose_history IS
    'Whether the patient has a history of overdose: yes, no, or empty.';
COMMENT ON COLUMN assessment_physical_health_impact.overdose_count IS
    'Number of previous overdose episodes.';
COMMENT ON COLUMN assessment_physical_health_impact.last_overdose_date IS
    'Date of most recent overdose.';
COMMENT ON COLUMN assessment_physical_health_impact.physical_health_notes IS
    'Additional clinician notes on physical health impact.';
