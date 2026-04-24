CREATE TABLE assessment_polypharmacy_review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    total_regular_medications INTEGER
        CHECK (total_regular_medications IS NULL OR total_regular_medications >= 0),
    total_prn_medications INTEGER
        CHECK (total_prn_medications IS NULL OR total_prn_medications >= 0),
    polypharmacy_flag VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (polypharmacy_flag IN ('yes', 'no', '')),
    medication_review_date DATE,
    falls_risk_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (falls_risk_medications IN ('yes', 'no', '')),
    falls_risk_medication_details TEXT NOT NULL DEFAULT '',
    anticholinergic_burden VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (anticholinergic_burden IN ('low', 'moderate', 'high', '')),
    drug_interactions_identified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (drug_interactions_identified IN ('yes', 'no', '')),
    drug_interaction_details TEXT NOT NULL DEFAULT '',
    adherence_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (adherence_concerns IN ('yes', 'no', '')),
    adherence_details TEXT NOT NULL DEFAULT '',
    stopp_start_review_done VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopp_start_review_done IN ('yes', 'no', '')),
    deprescribing_opportunities TEXT NOT NULL DEFAULT '',
    polypharmacy_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_polypharmacy_review_updated_at
    BEFORE UPDATE ON assessment_polypharmacy_review
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Individual medication entries (one-to-many child)

COMMENT ON TABLE assessment_polypharmacy_review IS
    'Assessment polypharmacy review.';
COMMENT ON COLUMN assessment_polypharmacy_review.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_polypharmacy_review.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_polypharmacy_review.total_regular_medications IS
    'Total regular medications.';
COMMENT ON COLUMN assessment_polypharmacy_review.total_prn_medications IS
    'Total prn medications.';
COMMENT ON COLUMN assessment_polypharmacy_review.polypharmacy_flag IS
    'Polypharmacy flag. One of: yes, no.';
COMMENT ON COLUMN assessment_polypharmacy_review.medication_review_date IS
    'Medication review date.';
COMMENT ON COLUMN assessment_polypharmacy_review.falls_risk_medications IS
    'Falls risk medications. One of: yes, no.';
COMMENT ON COLUMN assessment_polypharmacy_review.falls_risk_medication_details IS
    'Falls risk medication details.';
COMMENT ON COLUMN assessment_polypharmacy_review.anticholinergic_burden IS
    'Anticholinergic burden. One of: low, moderate, high.';
COMMENT ON COLUMN assessment_polypharmacy_review.drug_interactions_identified IS
    'Drug interactions identified. One of: yes, no.';
COMMENT ON COLUMN assessment_polypharmacy_review.drug_interaction_details IS
    'Drug interaction details.';
COMMENT ON COLUMN assessment_polypharmacy_review.adherence_concerns IS
    'Adherence concerns. One of: yes, no.';
COMMENT ON COLUMN assessment_polypharmacy_review.adherence_details IS
    'Adherence details.';
COMMENT ON COLUMN assessment_polypharmacy_review.stopp_start_review_done IS
    'Stopp start review done. One of: yes, no.';
COMMENT ON COLUMN assessment_polypharmacy_review.deprescribing_opportunities IS
    'Deprescribing opportunities.';
COMMENT ON COLUMN assessment_polypharmacy_review.polypharmacy_notes IS
    'Polypharmacy notes.';
COMMENT ON COLUMN assessment_polypharmacy_review.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_polypharmacy_review.updated_at IS
    'Timestamp when this row was last updated.';
