CREATE TABLE assessment_polypharmacy_review_medication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    polypharmacy_review_id UUID NOT NULL
        REFERENCES assessment_polypharmacy_review(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    route VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (route IN ('oral', 'topical', 'inhaled', 'injectable', 'patch', 'other', '')),
    indication VARCHAR(255) NOT NULL DEFAULT '',
    is_prn VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (is_prn IN ('yes', 'no', '')),
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TRIGGER trigger_assessment_polypharmacy_review_medication_updated_at
    BEFORE UPDATE ON assessment_polypharmacy_review_medication
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_polypharmacy_review IS
    'Polypharmacy review section: medication counts, falls-risk drugs, anticholinergic burden, and STOPP/START review. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_polypharmacy_review.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_polypharmacy_review.total_regular_medications IS
    'Total number of regular medications, NULL if unanswered.';
COMMENT ON COLUMN assessment_polypharmacy_review.total_prn_medications IS
    'Total number of as-needed (PRN) medications, NULL if unanswered.';
COMMENT ON COLUMN assessment_polypharmacy_review.polypharmacy_flag IS
    'Whether polypharmacy is flagged (5+ medications): yes, no, or empty string.';
COMMENT ON COLUMN assessment_polypharmacy_review.medication_review_date IS
    'Date of last medication review, NULL if unanswered.';
COMMENT ON COLUMN assessment_polypharmacy_review.falls_risk_medications IS
    'Whether the patient is taking falls-risk medications (e.g. sedatives, antihypertensives): yes, no, or empty string.';
COMMENT ON COLUMN assessment_polypharmacy_review.falls_risk_medication_details IS
    'Details of falls-risk medications.';
COMMENT ON COLUMN assessment_polypharmacy_review.anticholinergic_burden IS
    'Anticholinergic burden level: low, moderate, high, or empty string.';
COMMENT ON COLUMN assessment_polypharmacy_review.drug_interactions_identified IS
    'Whether significant drug interactions have been identified: yes, no, or empty string.';
COMMENT ON COLUMN assessment_polypharmacy_review.drug_interaction_details IS
    'Details of significant drug interactions.';
COMMENT ON COLUMN assessment_polypharmacy_review.adherence_concerns IS
    'Whether there are medication adherence concerns: yes, no, or empty string.';
COMMENT ON COLUMN assessment_polypharmacy_review.adherence_details IS
    'Details of adherence concerns.';
COMMENT ON COLUMN assessment_polypharmacy_review.stopp_start_review_done IS
    'Whether a STOPP/START criteria review has been done: yes, no, or empty string.';
COMMENT ON COLUMN assessment_polypharmacy_review.deprescribing_opportunities IS
    'Free-text description of deprescribing opportunities identified.';
COMMENT ON COLUMN assessment_polypharmacy_review.polypharmacy_notes IS
    'Free-text notes on polypharmacy review.';
COMMENT ON TABLE assessment_polypharmacy_review_medication IS
    'Individual medication entry within the polypharmacy review.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.dose IS
    'Dose and strength (e.g. 5mg, 10mg/5ml).';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.frequency IS
    'Dosing frequency (e.g. once daily, twice daily, PRN).';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.route IS
    'Route of administration: oral, topical, inhaled, injectable, patch, other, or empty string.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.indication IS
    'Clinical indication for the medication.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.is_prn IS
    'Whether this is a PRN (as-needed) medication: yes, no, or empty string.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.sort_order IS
    'Display order within the medication list.';

COMMENT ON COLUMN assessment_polypharmacy_review.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_polypharmacy_review.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_polypharmacy_review.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.polypharmacy_review_id IS
    'Foreign key to the assessment_polypharmacy_review table.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_polypharmacy_review_medication.deleted_at IS
    'Timestamp when this row was deleted.';
