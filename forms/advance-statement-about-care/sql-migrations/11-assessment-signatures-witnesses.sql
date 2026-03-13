-- 11_assessment_signatures_witnesses.sql
-- Signatures and witnesses section of the advance statement about care.

CREATE TABLE assessment_signatures_witnesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    maker_signature_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (maker_signature_obtained IN ('yes', 'no', '')),
    maker_signature_date DATE,
    witness_name VARCHAR(255) NOT NULL DEFAULT '',
    witness_address TEXT NOT NULL DEFAULT '',
    witness_signature_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (witness_signature_obtained IN ('yes', 'no', '')),
    witness_signature_date DATE,
    review_date DATE,
    review_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_signatures_witnesses_updated_at
    BEFORE UPDATE ON assessment_signatures_witnesses
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_signatures_witnesses IS
    'Signatures and witnesses section: records the signing and witnessing of the advance statement. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_signatures_witnesses.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_signatures_witnesses.maker_signature_obtained IS
    'Whether the person making the advance statement has signed it.';
COMMENT ON COLUMN assessment_signatures_witnesses.maker_signature_date IS
    'Date the maker signed, NULL if unanswered.';
COMMENT ON COLUMN assessment_signatures_witnesses.witness_name IS
    'Full name of the witness.';
COMMENT ON COLUMN assessment_signatures_witnesses.witness_address IS
    'Address of the witness.';
COMMENT ON COLUMN assessment_signatures_witnesses.witness_signature_obtained IS
    'Whether the witness provided their signature.';
COMMENT ON COLUMN assessment_signatures_witnesses.witness_signature_date IS
    'Date the witness signed, NULL if unanswered.';
COMMENT ON COLUMN assessment_signatures_witnesses.review_date IS
    'Date when the advance statement should be reviewed, NULL if unanswered.';
COMMENT ON COLUMN assessment_signatures_witnesses.review_notes IS
    'Notes about when and how the statement should be reviewed.';
