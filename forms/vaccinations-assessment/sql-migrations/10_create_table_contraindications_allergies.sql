CREATE TABLE contraindications_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    egg_allergy VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (egg_allergy IN ('yes', 'no', '')),
    gelatin_allergy VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (gelatin_allergy IN ('yes', 'no', '')),
    latex_allergy VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (latex_allergy IN ('yes', 'no', '')),
    neomycin_allergy VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (neomycin_allergy IN ('yes', 'no', '')),
    pregnant VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pregnant IN ('yes', 'no', 'notApplicable', '')),
    pregnancy_weeks VARCHAR(10) NOT NULL DEFAULT '',
    severe_illness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severe_illness IN ('yes', 'no', '')),
    previous_anaphylaxis VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (previous_anaphylaxis IN ('yes', 'no', '')),
    anaphylaxis_details TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_contraindications_allergies_updated_at
    BEFORE UPDATE ON contraindications_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE contraindications_allergies IS
    'Contraindication and allergy screening for vaccination. One-to-one child of assessment.';

COMMENT ON COLUMN contraindications_allergies.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN contraindications_allergies.egg_allergy IS
    'Egg allergy. One of: yes, no.';
COMMENT ON COLUMN contraindications_allergies.gelatin_allergy IS
    'Gelatin allergy. One of: yes, no.';
COMMENT ON COLUMN contraindications_allergies.latex_allergy IS
    'Latex allergy. One of: yes, no.';
COMMENT ON COLUMN contraindications_allergies.neomycin_allergy IS
    'Neomycin allergy. One of: yes, no.';
COMMENT ON COLUMN contraindications_allergies.pregnant IS
    'Pregnant. One of: yes, no, notApplicable.';
COMMENT ON COLUMN contraindications_allergies.pregnancy_weeks IS
    'Pregnancy weeks.';
COMMENT ON COLUMN contraindications_allergies.severe_illness IS
    'Severe illness. One of: yes, no.';
COMMENT ON COLUMN contraindications_allergies.previous_anaphylaxis IS
    'Previous anaphylaxis. One of: yes, no.';
COMMENT ON COLUMN contraindications_allergies.anaphylaxis_details IS
    'Anaphylaxis details.';
COMMENT ON COLUMN contraindications_allergies.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN contraindications_allergies.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN contraindications_allergies.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN contraindications_allergies.deleted_at IS
    'Timestamp when this row was deleted.';
