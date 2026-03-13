-- 10_assessment_lasting_power_of_attorney.sql
-- Lasting Power of Attorney section of the advance decision to refuse treatment.

CREATE TABLE assessment_lasting_power_of_attorney (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_health_welfare_lpa VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_health_welfare_lpa IN ('yes', 'no', '')),
    lpa_registered_with_opg VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lpa_registered_with_opg IN ('yes', 'no', '')),
    lpa_registration_date DATE,
    attorney_name VARCHAR(255) NOT NULL DEFAULT '',
    attorney_address TEXT NOT NULL DEFAULT '',
    attorney_phone VARCHAR(30) NOT NULL DEFAULT '',
    replacement_attorney_name VARCHAR(255) NOT NULL DEFAULT '',
    lpa_authority_scope TEXT NOT NULL DEFAULT '',
    lpa_conflicts_with_adrt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lpa_conflicts_with_adrt IN ('yes', 'no', '')),
    lpa_conflict_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lasting_power_of_attorney_updated_at
    BEFORE UPDATE ON assessment_lasting_power_of_attorney
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lasting_power_of_attorney IS
    'Lasting Power of Attorney section: records whether the person has a health and welfare LPA, which may override or interact with this advance decision per s.25(2)(b) Mental Capacity Act 2005. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.has_health_welfare_lpa IS
    'Whether the person has a health and welfare Lasting Power of Attorney.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.lpa_registered_with_opg IS
    'Whether the LPA has been registered with the Office of the Public Guardian.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.lpa_registration_date IS
    'Date the LPA was registered, NULL if unanswered.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.attorney_name IS
    'Full name of the appointed attorney.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.attorney_address IS
    'Address of the appointed attorney.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.attorney_phone IS
    'Phone number of the appointed attorney.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.replacement_attorney_name IS
    'Full name of the replacement attorney, if appointed.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.lpa_authority_scope IS
    'Scope of authority granted under the LPA, particularly relating to treatment decisions.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.lpa_conflicts_with_adrt IS
    'Whether the LPA scope conflicts with this advance decision to refuse treatment.';
COMMENT ON COLUMN assessment_lasting_power_of_attorney.lpa_conflict_details IS
    'Details of any conflicts between the LPA authority and this advance decision.';
