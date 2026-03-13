-- 07_assessment_treatments_refused_life_sustaining.sql
-- Life-sustaining treatments refused section of the advance decision to refuse treatment.

CREATE TABLE assessment_treatments_refused_life_sustaining (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    includes_life_sustaining_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (includes_life_sustaining_treatment IN ('yes', 'no', '')),
    understands_may_result_in_death VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (understands_may_result_in_death IN ('yes', 'no', '')),
    life_sustaining_treatments_specified TEXT NOT NULL DEFAULT '',
    is_written_and_signed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (is_written_and_signed IN ('yes', 'no', '')),
    is_witnessed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (is_witnessed IN ('yes', 'no', '')),
    witness_confirmation TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatments_refused_life_sustaining_updated_at
    BEFORE UPDATE ON assessment_treatments_refused_life_sustaining
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatments_refused_life_sustaining IS
    'Life-sustaining treatments refused section: per s.25(5) Mental Capacity Act 2005, refusal of life-sustaining treatment must be verified, in writing, and witnessed. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatments_refused_life_sustaining.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatments_refused_life_sustaining.includes_life_sustaining_treatment IS
    'Whether this advance decision extends to refusing life-sustaining treatment.';
COMMENT ON COLUMN assessment_treatments_refused_life_sustaining.understands_may_result_in_death IS
    'Whether the person confirms understanding that refusing life-sustaining treatment may result in death.';
COMMENT ON COLUMN assessment_treatments_refused_life_sustaining.life_sustaining_treatments_specified IS
    'Free-text specification of which life-sustaining treatments are refused.';
COMMENT ON COLUMN assessment_treatments_refused_life_sustaining.is_written_and_signed IS
    'Whether the life-sustaining refusal is documented in writing and signed, as legally required.';
COMMENT ON COLUMN assessment_treatments_refused_life_sustaining.is_witnessed IS
    'Whether the signature was witnessed, as legally required for life-sustaining treatment refusal.';
COMMENT ON COLUMN assessment_treatments_refused_life_sustaining.witness_confirmation IS
    'Witness statement confirming they saw the person sign the advance decision.';
