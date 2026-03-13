-- 11_assessment_risk_summary.sql
-- Risk assessment summary section of the assessment.

CREATE TABLE assessment_risk_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    risk_region VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (risk_region IN ('low', 'moderate', 'high', 'veryHigh', '')),
    additional_risk_factors TEXT NOT NULL DEFAULT '',
    clinical_notes TEXT NOT NULL DEFAULT '',
    agreed_treatment_targets TEXT NOT NULL DEFAULT '',
    follow_up_interval VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (follow_up_interval IN ('1month', '3months', '6months', '12months', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_risk_summary_updated_at
    BEFORE UPDATE ON assessment_risk_summary
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_risk_summary IS
    'Risk assessment summary section: risk region, clinical notes, treatment targets, and follow-up. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_risk_summary.risk_region IS
    'SCORE2-Diabetes risk region: low, moderate, high, or veryHigh.';
COMMENT ON COLUMN assessment_risk_summary.additional_risk_factors IS
    'Free-text additional risk factors not captured elsewhere.';
COMMENT ON COLUMN assessment_risk_summary.clinical_notes IS
    'Clinician observations and recommendations.';
COMMENT ON COLUMN assessment_risk_summary.agreed_treatment_targets IS
    'Agreed treatment targets (e.g. HbA1c, BP, LDL).';
COMMENT ON COLUMN assessment_risk_summary.follow_up_interval IS
    'Planned follow-up interval: 1month, 3months, 6months, or 12months.';
