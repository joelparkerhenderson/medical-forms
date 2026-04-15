--liquibase formatted sql

--changeset author:1
CREATE TABLE prescription_substitution_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prescription_request_id UUID NOT NULL UNIQUE
        REFERENCES prescription_request(id) ON DELETE CASCADE,

    allow_brand_substitution VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (allow_brand_substitution IN ('yes', 'no', '')),
    allow_generic_substitution VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (allow_generic_substitution IN ('yes', 'no', '')),
    allow_dosage_adjustment VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (allow_dosage_adjustment IN ('yes', 'no', '')),
    substitution_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_prescription_substitution_options_updated_at
    BEFORE UPDATE ON prescription_substitution_options
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE prescription_substitution_options IS
    'Substitution preferences for a prescription request. One-to-one child of prescription_request.';
COMMENT ON COLUMN prescription_substitution_options.allow_brand_substitution IS 'Whether a different brand name is acceptable: yes, no, or empty.';
COMMENT ON COLUMN prescription_substitution_options.allow_generic_substitution IS 'Whether a generic equivalent is acceptable: yes, no, or empty.';
COMMENT ON COLUMN prescription_substitution_options.allow_dosage_adjustment IS 'Whether a different dosage is acceptable: yes, no, or empty.';
COMMENT ON COLUMN prescription_substitution_options.substitution_notes IS 'Additional notes about substitution preferences.';
--rollback DROP TABLE prescription_substitution_options;
