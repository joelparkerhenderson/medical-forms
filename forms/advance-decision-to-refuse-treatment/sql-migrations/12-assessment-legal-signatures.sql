-- 12_assessment_legal_signatures.sql
-- Legal signatures section of the advance decision to refuse treatment.

CREATE TABLE assessment_legal_signatures (
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
    second_witness_name VARCHAR(255) NOT NULL DEFAULT '',
    second_witness_signature_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (second_witness_signature_obtained IN ('yes', 'no', '')),
    declaration_statement_agreed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (declaration_statement_agreed IN ('yes', 'no', '')),
    legal_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_legal_signatures_updated_at
    BEFORE UPDATE ON assessment_legal_signatures
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_legal_signatures IS
    'Legal signatures section: records signatures of the maker, witness(es), and declaration. Witnessing is legally required for refusal of life-sustaining treatment per s.25(6) Mental Capacity Act 2005. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_legal_signatures.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_legal_signatures.maker_signature_obtained IS
    'Whether the person making the advance decision has signed it.';
COMMENT ON COLUMN assessment_legal_signatures.maker_signature_date IS
    'Date the maker signed, NULL if unanswered.';
COMMENT ON COLUMN assessment_legal_signatures.witness_name IS
    'Full name of the primary witness.';
COMMENT ON COLUMN assessment_legal_signatures.witness_address IS
    'Address of the primary witness.';
COMMENT ON COLUMN assessment_legal_signatures.witness_signature_obtained IS
    'Whether the primary witness provided their signature.';
COMMENT ON COLUMN assessment_legal_signatures.witness_signature_date IS
    'Date the primary witness signed, NULL if unanswered.';
COMMENT ON COLUMN assessment_legal_signatures.second_witness_name IS
    'Full name of the second witness, if applicable.';
COMMENT ON COLUMN assessment_legal_signatures.second_witness_signature_obtained IS
    'Whether a second witness provided their signature.';
COMMENT ON COLUMN assessment_legal_signatures.declaration_statement_agreed IS
    'Whether the maker has agreed to the declaration statement confirming the accuracy of the advance decision.';
COMMENT ON COLUMN assessment_legal_signatures.legal_notes IS
    'Any additional notes relating to the legal execution of the advance decision.';
