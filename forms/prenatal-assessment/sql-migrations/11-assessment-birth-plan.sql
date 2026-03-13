-- 11_assessment_birth_plan.sql
-- Birth plan preferences section of the prenatal assessment.

CREATE TABLE assessment_birth_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_birth_location VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (preferred_birth_location IN ('hospital', 'birth-centre', 'home', 'undecided', '')),
    preferred_delivery_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (preferred_delivery_method IN ('vaginal', 'water-birth', 'elective-caesarean', 'no-preference', '')),
    pain_relief_preference VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (pain_relief_preference IN ('epidural', 'gas-and-air', 'pethidine', 'tens', 'natural', 'no-preference', '')),
    birth_partner VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (birth_partner IN ('yes', 'no', '')),
    birth_partner_details TEXT NOT NULL DEFAULT '',
    skin_to_skin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (skin_to_skin IN ('yes', 'no', '')),
    delayed_cord_clamping VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (delayed_cord_clamping IN ('yes', 'no', '')),
    infant_feeding_intention VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (infant_feeding_intention IN ('breastfeed', 'formula', 'combination', 'undecided', '')),
    vitamin_k_consent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vitamin_k_consent IN ('yes', 'no', '')),
    vitamin_k_route VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vitamin_k_route IN ('injection', 'oral', 'no-preference', '')),
    cord_blood_banking VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cord_blood_banking IN ('yes', 'no', '')),
    cultural_religious_needs TEXT NOT NULL DEFAULT '',
    special_requests TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_birth_plan_updated_at
    BEFORE UPDATE ON assessment_birth_plan
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_birth_plan IS
    'Birth plan preferences section: delivery location, method, pain relief, infant feeding, and cultural needs. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_birth_plan.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_birth_plan.preferred_birth_location IS
    'Preferred location for birth: hospital, birth-centre, home, undecided, or empty.';
COMMENT ON COLUMN assessment_birth_plan.preferred_delivery_method IS
    'Preferred delivery method: vaginal, water-birth, elective-caesarean, no-preference, or empty.';
COMMENT ON COLUMN assessment_birth_plan.pain_relief_preference IS
    'Preferred pain relief method: epidural, gas-and-air, pethidine, tens, natural, no-preference, or empty.';
COMMENT ON COLUMN assessment_birth_plan.birth_partner IS
    'Whether the patient has a birth partner.';
COMMENT ON COLUMN assessment_birth_plan.skin_to_skin IS
    'Whether the patient requests immediate skin-to-skin contact after delivery.';
COMMENT ON COLUMN assessment_birth_plan.delayed_cord_clamping IS
    'Whether the patient requests delayed cord clamping.';
COMMENT ON COLUMN assessment_birth_plan.infant_feeding_intention IS
    'Intended infant feeding method: breastfeed, formula, combination, undecided, or empty.';
COMMENT ON COLUMN assessment_birth_plan.vitamin_k_consent IS
    'Whether the patient consents to vitamin K prophylaxis for the newborn.';
COMMENT ON COLUMN assessment_birth_plan.vitamin_k_route IS
    'Preferred route for vitamin K: injection, oral, no-preference, or empty.';
COMMENT ON COLUMN assessment_birth_plan.cord_blood_banking IS
    'Whether the patient wishes to bank cord blood.';
