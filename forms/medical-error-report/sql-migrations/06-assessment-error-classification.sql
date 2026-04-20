-- 06_assessment_error_classification.sql
-- Error classification section of the medical error report.

CREATE TABLE assessment_error_classification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    error_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (error_type IN ('medication', 'surgical', 'diagnostic', 'treatment', 'communication', 'equipment', 'fall', 'infection', 'transfusion', 'other', '')),
    error_type_details TEXT NOT NULL DEFAULT '',
    medication_error_stage VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (medication_error_stage IN ('prescribing', 'dispensing', 'administration', 'monitoring', 'other', '')),
    who_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (who_severity IN ('near-miss', 'mild', 'moderate', 'severe', 'critical', '')),
    ncc_merp_category VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ncc_merp_category IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', '')),
    preventability VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (preventability IN ('clearly-preventable', 'probably-preventable', 'probably-not-preventable', 'clearly-not-preventable', 'unknown', '')),
    recurrence_likelihood VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (recurrence_likelihood IN ('very-likely', 'likely', 'unlikely', 'very-unlikely', 'unknown', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_error_classification_updated_at
    BEFORE UPDATE ON assessment_error_classification
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_error_classification IS
    'Error classification section: error type, WHO severity, NCC MERP category, preventability. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_error_classification.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_error_classification.error_type IS
    'Type of error: medication, surgical, diagnostic, treatment, communication, equipment, fall, infection, transfusion, other, or empty.';
COMMENT ON COLUMN assessment_error_classification.error_type_details IS
    'Additional details about the error type.';
COMMENT ON COLUMN assessment_error_classification.medication_error_stage IS
    'Stage of medication error if applicable: prescribing, dispensing, administration, monitoring, other, or empty.';
COMMENT ON COLUMN assessment_error_classification.who_severity IS
    'WHO severity scale: near-miss, mild, moderate, severe, critical, or empty.';
COMMENT ON COLUMN assessment_error_classification.ncc_merp_category IS
    'NCC MERP harm category: A through I, or empty.';
COMMENT ON COLUMN assessment_error_classification.preventability IS
    'Whether the error was preventable: clearly-preventable, probably-preventable, probably-not-preventable, clearly-not-preventable, unknown, or empty.';
COMMENT ON COLUMN assessment_error_classification.recurrence_likelihood IS
    'Likelihood of recurrence: very-likely, likely, unlikely, very-unlikely, unknown, or empty.';
