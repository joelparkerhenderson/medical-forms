CREATE TABLE assessment_cancer_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    family_cancer_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_cancer_history IN ('yes', 'no', '')),
    multiple_family_cancers VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (multiple_family_cancers IN ('yes', 'no', '')),
    early_onset_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (early_onset_cancer IN ('yes', 'no', '')),
    bilateral_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bilateral_cancer IN ('yes', 'no', '')),
    rare_tumour_types VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rare_tumour_types IN ('yes', 'no', '')),
    rare_tumour_details TEXT NOT NULL DEFAULT '',
    known_cancer_syndrome VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_cancer_syndrome IN ('yes', 'no', '')),
    cancer_syndrome_details TEXT NOT NULL DEFAULT '',
    cancer_risk_score INTEGER
        CHECK (cancer_risk_score IS NULL OR (cancer_risk_score >= 0 AND cancer_risk_score <= 10))
);

CREATE TRIGGER trigger_assessment_cancer_history_updated_at
    BEFORE UPDATE ON assessment_cancer_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Individual family cancer entries (one-to-many child)

COMMENT ON TABLE assessment_cancer_history IS
    'Assessment cancer history.';
COMMENT ON COLUMN assessment_cancer_history.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_cancer_history.family_cancer_history IS
    'Family cancer history. One of: yes, no.';
COMMENT ON COLUMN assessment_cancer_history.multiple_family_cancers IS
    'Multiple family cancers. One of: yes, no.';
COMMENT ON COLUMN assessment_cancer_history.early_onset_cancer IS
    'Early onset cancer. One of: yes, no.';
COMMENT ON COLUMN assessment_cancer_history.bilateral_cancer IS
    'Bilateral cancer. One of: yes, no.';
COMMENT ON COLUMN assessment_cancer_history.rare_tumour_types IS
    'Rare tumour types. One of: yes, no.';
COMMENT ON COLUMN assessment_cancer_history.rare_tumour_details IS
    'Rare tumour details.';
COMMENT ON COLUMN assessment_cancer_history.known_cancer_syndrome IS
    'Known cancer syndrome. One of: yes, no.';
COMMENT ON COLUMN assessment_cancer_history.cancer_syndrome_details IS
    'Cancer syndrome details.';
COMMENT ON COLUMN assessment_cancer_history.cancer_risk_score IS
    'Cancer risk score.';
COMMENT ON COLUMN assessment_cancer_history.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_cancer_history.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_cancer_history.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_cancer_history.deleted_at IS
    'Timestamp when this row was deleted.';
