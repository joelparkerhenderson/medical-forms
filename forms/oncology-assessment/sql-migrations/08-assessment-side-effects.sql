-- 08_assessment_side_effects.sql
-- Side effects section of the oncology assessment.

CREATE TABLE assessment_side_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_haematological_toxicity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_haematological_toxicity IN ('yes', 'no', '')),
    neutropenia_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neutropenia_grade IN ('1', '2', '3', '4', '')),
    anaemia_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anaemia_grade IN ('1', '2', '3', '4', '')),
    thrombocytopenia_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (thrombocytopenia_grade IN ('1', '2', '3', '4', '')),
    has_dermatological_toxicity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_dermatological_toxicity IN ('yes', 'no', '')),
    dermatological_details TEXT NOT NULL DEFAULT '',
    has_neuropathy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_neuropathy IN ('yes', 'no', '')),
    neuropathy_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neuropathy_grade IN ('1', '2', '3', '4', '')),
    neuropathy_details TEXT NOT NULL DEFAULT '',
    has_hepatotoxicity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hepatotoxicity IN ('yes', 'no', '')),
    hepatotoxicity_details TEXT NOT NULL DEFAULT '',
    has_nephrotoxicity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_nephrotoxicity IN ('yes', 'no', '')),
    nephrotoxicity_details TEXT NOT NULL DEFAULT '',
    has_cardiotoxicity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cardiotoxicity IN ('yes', 'no', '')),
    cardiotoxicity_details TEXT NOT NULL DEFAULT '',
    has_mucositis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_mucositis IN ('yes', 'no', '')),
    mucositis_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mucositis_grade IN ('1', '2', '3', '4', '')),
    alopecia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alopecia IN ('yes', 'no', '')),
    other_side_effects TEXT NOT NULL DEFAULT '',
    side_effects_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_side_effects_updated_at
    BEFORE UPDATE ON assessment_side_effects
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_side_effects IS
    'Side effects section: haematological, dermatological, neurological, and organ-specific treatment toxicities (CTCAE grading). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_side_effects.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_side_effects.has_haematological_toxicity IS
    'Whether haematological toxicity is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_side_effects.neutropenia_grade IS
    'CTCAE grade for neutropenia (1-4) or empty if not applicable.';
COMMENT ON COLUMN assessment_side_effects.anaemia_grade IS
    'CTCAE grade for anaemia (1-4) or empty if not applicable.';
COMMENT ON COLUMN assessment_side_effects.thrombocytopenia_grade IS
    'CTCAE grade for thrombocytopenia (1-4) or empty if not applicable.';
COMMENT ON COLUMN assessment_side_effects.has_dermatological_toxicity IS
    'Whether dermatological toxicity is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_side_effects.dermatological_details IS
    'Details of dermatological side effects (rash, hand-foot syndrome, etc.).';
COMMENT ON COLUMN assessment_side_effects.has_neuropathy IS
    'Whether peripheral neuropathy is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_side_effects.neuropathy_grade IS
    'CTCAE grade for peripheral neuropathy (1-4) or empty.';
COMMENT ON COLUMN assessment_side_effects.neuropathy_details IS
    'Details of neuropathy symptoms and distribution.';
COMMENT ON COLUMN assessment_side_effects.has_hepatotoxicity IS
    'Whether hepatotoxicity is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_side_effects.hepatotoxicity_details IS
    'Details of liver toxicity findings.';
COMMENT ON COLUMN assessment_side_effects.has_nephrotoxicity IS
    'Whether nephrotoxicity is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_side_effects.nephrotoxicity_details IS
    'Details of renal toxicity findings.';
COMMENT ON COLUMN assessment_side_effects.has_cardiotoxicity IS
    'Whether cardiotoxicity is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_side_effects.cardiotoxicity_details IS
    'Details of cardiac toxicity findings (e.g. reduced LVEF).';
COMMENT ON COLUMN assessment_side_effects.has_mucositis IS
    'Whether mucositis is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_side_effects.mucositis_grade IS
    'CTCAE grade for mucositis (1-4) or empty.';
COMMENT ON COLUMN assessment_side_effects.alopecia IS
    'Whether alopecia is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_side_effects.other_side_effects IS
    'Other treatment side effects not listed above.';
COMMENT ON COLUMN assessment_side_effects.side_effects_notes IS
    'Additional clinician notes on side effects.';
