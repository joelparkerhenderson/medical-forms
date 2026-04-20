-- 10_assessment_contraindications_allergies.sql
-- Contraindications and allergies section of the vaccinations checklist.

CREATE TABLE assessment_contraindications_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    egg_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (egg_allergy IN ('yes', 'no', '')),
    egg_allergy_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (egg_allergy_severity IN ('mild', 'moderate', 'severe', 'anaphylaxis', '')),
    gelatin_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gelatin_allergy IN ('yes', 'no', '')),
    neomycin_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neomycin_allergy IN ('yes', 'no', '')),
    latex_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (latex_allergy IN ('yes', 'no', '')),
    yeast_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (yeast_allergy IN ('yes', 'no', '')),
    peg_polysorbate_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (peg_polysorbate_allergy IN ('yes', 'no', '')),
    other_vaccine_allergies TEXT NOT NULL DEFAULT '',
    history_of_gbs VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_gbs IN ('yes', 'no', '')),
    gbs_details TEXT NOT NULL DEFAULT '',
    on_immunosuppressants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_immunosuppressants IN ('yes', 'no', '')),
    immunosuppressant_details TEXT NOT NULL DEFAULT '',
    on_blood_products_recent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_blood_products_recent IN ('yes', 'no', '')),
    blood_products_details TEXT NOT NULL DEFAULT '',
    live_vaccine_contraindicated VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (live_vaccine_contraindicated IN ('yes', 'no', '')),
    live_vaccine_contraindication_reason TEXT NOT NULL DEFAULT '',
    contraindications_allergies_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_contraindications_allergies_updated_at
    BEFORE UPDATE ON assessment_contraindications_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_contraindications_allergies IS
    'Contraindications and allergies section: vaccine-specific allergies, GBS history, immunosuppression, live vaccine contraindications. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_contraindications_allergies.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_contraindications_allergies.egg_allergy IS
    'Whether the patient has an egg allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.egg_allergy_severity IS
    'Severity of egg allergy: mild, moderate, severe, anaphylaxis, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.gelatin_allergy IS
    'Whether the patient has a gelatin allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.neomycin_allergy IS
    'Whether the patient has a neomycin allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.latex_allergy IS
    'Whether the patient has a latex allergy: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.yeast_allergy IS
    'Whether the patient has a yeast allergy (relevant to Hep B, HPV): yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.peg_polysorbate_allergy IS
    'Whether the patient has a PEG/polysorbate allergy (relevant to COVID mRNA vaccines): yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.other_vaccine_allergies IS
    'Free-text list of other vaccine-related allergies.';
COMMENT ON COLUMN assessment_contraindications_allergies.history_of_gbs IS
    'Whether the patient has a history of Guillain-Barre Syndrome: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.gbs_details IS
    'Details of GBS history including timing relative to vaccination.';
COMMENT ON COLUMN assessment_contraindications_allergies.on_immunosuppressants IS
    'Whether the patient is currently on immunosuppressant medication: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.immunosuppressant_details IS
    'Details of immunosuppressant therapy.';
COMMENT ON COLUMN assessment_contraindications_allergies.on_blood_products_recent IS
    'Whether the patient has received blood products recently: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.blood_products_details IS
    'Details of recent blood product administration.';
COMMENT ON COLUMN assessment_contraindications_allergies.live_vaccine_contraindicated IS
    'Whether live vaccines are contraindicated: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraindications_allergies.live_vaccine_contraindication_reason IS
    'Reason live vaccines are contraindicated.';
COMMENT ON COLUMN assessment_contraindications_allergies.contraindications_allergies_notes IS
    'Additional notes on contraindications and allergies.';
