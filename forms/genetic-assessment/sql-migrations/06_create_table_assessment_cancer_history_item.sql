CREATE TABLE assessment_cancer_history_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cancer_history_id UUID NOT NULL
        REFERENCES assessment_cancer_history(id) ON DELETE CASCADE,

    relative_relationship VARCHAR(50) NOT NULL DEFAULT '',
    cancer_type VARCHAR(255) NOT NULL DEFAULT '',
    age_at_diagnosis INTEGER
        CHECK (age_at_diagnosis IS NULL OR (age_at_diagnosis >= 0 AND age_at_diagnosis <= 120)),
    outcome VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (outcome IN ('alive', 'deceased', 'unknown', '')),
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_cancer_history_item_updated_at
    BEFORE UPDATE ON assessment_cancer_history_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cancer_history IS
    'Cancer history section: family cancer patterns, early onset, bilateral cancers, and known syndromes. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cancer_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cancer_history.family_cancer_history IS
    'Whether there is a family history of cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cancer_history.multiple_family_cancers IS
    'Whether multiple family members have had cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cancer_history.early_onset_cancer IS
    'Whether any family member had cancer diagnosed before age 50: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cancer_history.bilateral_cancer IS
    'Whether any family member had bilateral cancer (both sides of a paired organ): yes, no, or empty string.';
COMMENT ON COLUMN assessment_cancer_history.rare_tumour_types IS
    'Whether any family member had a rare tumour type: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cancer_history.rare_tumour_details IS
    'Details of rare tumour types reported.';
COMMENT ON COLUMN assessment_cancer_history.known_cancer_syndrome IS
    'Whether a cancer predisposition syndrome is known in the family (e.g. BRCA, Lynch): yes, no, or empty string.';
COMMENT ON COLUMN assessment_cancer_history.cancer_syndrome_details IS
    'Details of known cancer predisposition syndromes.';
COMMENT ON COLUMN assessment_cancer_history.cancer_risk_score IS
    'Computed cancer genetics risk sub-score, NULL if not yet scored.';
COMMENT ON TABLE assessment_cancer_history_item IS
    'Individual family cancer entry with relative, cancer type, age at diagnosis, and outcome.';
COMMENT ON COLUMN assessment_cancer_history_item.relative_relationship IS
    'Relationship to the patient (e.g. mother, father, sister, maternal aunt).';
COMMENT ON COLUMN assessment_cancer_history_item.cancer_type IS
    'Type of cancer diagnosed.';
COMMENT ON COLUMN assessment_cancer_history_item.age_at_diagnosis IS
    'Age at cancer diagnosis in years, NULL if unknown.';
COMMENT ON COLUMN assessment_cancer_history_item.outcome IS
    'Outcome: alive, deceased, unknown, or empty string.';
COMMENT ON COLUMN assessment_cancer_history_item.sort_order IS
    'Display order within the list.';

COMMENT ON COLUMN assessment_cancer_history.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_cancer_history.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_cancer_history.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_cancer_history_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_cancer_history_item.cancer_history_id IS
    'Foreign key to the assessment_cancer_history table.';
COMMENT ON COLUMN assessment_cancer_history_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_cancer_history_item.updated_at IS
    'Timestamp when this row was last updated.';
