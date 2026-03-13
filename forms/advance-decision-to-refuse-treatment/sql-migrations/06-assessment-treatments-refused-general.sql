-- 06_assessment_treatments_refused_general.sql
-- General treatments refused section of the advance decision to refuse treatment.

CREATE TABLE assessment_treatments_refused_general (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    refuses_cardiopulmonary_resuscitation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (refuses_cardiopulmonary_resuscitation IN ('yes', 'no', '')),
    refuses_mechanical_ventilation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (refuses_mechanical_ventilation IN ('yes', 'no', '')),
    refuses_artificial_nutrition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (refuses_artificial_nutrition IN ('yes', 'no', '')),
    refuses_artificial_hydration VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (refuses_artificial_hydration IN ('yes', 'no', '')),
    refuses_antibiotics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (refuses_antibiotics IN ('yes', 'no', '')),
    refuses_blood_transfusion VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (refuses_blood_transfusion IN ('yes', 'no', '')),
    refuses_dialysis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (refuses_dialysis IN ('yes', 'no', '')),
    other_treatments_refused TEXT NOT NULL DEFAULT '',
    treatment_refusal_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatments_refused_general_updated_at
    BEFORE UPDATE ON assessment_treatments_refused_general
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatments_refused_general IS
    'General treatments refused section: specific medical treatments the person wishes to refuse. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatments_refused_general.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatments_refused_general.refuses_cardiopulmonary_resuscitation IS
    'Whether the person refuses CPR.';
COMMENT ON COLUMN assessment_treatments_refused_general.refuses_mechanical_ventilation IS
    'Whether the person refuses mechanical ventilation or intubation.';
COMMENT ON COLUMN assessment_treatments_refused_general.refuses_artificial_nutrition IS
    'Whether the person refuses artificial nutrition (e.g. PEG feeding).';
COMMENT ON COLUMN assessment_treatments_refused_general.refuses_artificial_hydration IS
    'Whether the person refuses artificial hydration (e.g. IV fluids).';
COMMENT ON COLUMN assessment_treatments_refused_general.refuses_antibiotics IS
    'Whether the person refuses antibiotic treatment.';
COMMENT ON COLUMN assessment_treatments_refused_general.refuses_blood_transfusion IS
    'Whether the person refuses blood transfusion.';
COMMENT ON COLUMN assessment_treatments_refused_general.refuses_dialysis IS
    'Whether the person refuses dialysis.';
COMMENT ON COLUMN assessment_treatments_refused_general.other_treatments_refused IS
    'Free-text list of any other treatments the person wishes to refuse.';
COMMENT ON COLUMN assessment_treatments_refused_general.treatment_refusal_details IS
    'Additional details or context about the treatment refusals.';
