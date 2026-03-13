-- 08_contraindications_allergies.sql
-- Contraindications and allergies section (Step 7).

CREATE TABLE contraindications_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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
    anaphylaxis_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_contraindications_allergies_updated_at
    BEFORE UPDATE ON contraindications_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE contraindications_allergies IS
    'Contraindication and allergy screening for vaccination. One-to-one child of assessment.';
