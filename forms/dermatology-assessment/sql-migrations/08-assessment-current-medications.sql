-- 08_assessment_current_medications.sql
-- Step 6: Current medications section of the dermatology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_topical_steroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_topical_steroids IN ('yes', 'no', '')),
    topical_steroid_name VARCHAR(255) NOT NULL DEFAULT '',
    topical_steroid_potency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (topical_steroid_potency IN ('mild', 'moderate', 'potent', 'very_potent', '')),
    takes_systemic_immunosuppressants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_systemic_immunosuppressants IN ('yes', 'no', '')),
    immunosuppressant_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_biologics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_biologics IN ('yes', 'no', '')),
    biologic_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_retinoids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_retinoids IN ('yes', 'no', '')),
    retinoid_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_antibiotics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_antibiotics IN ('yes', 'no', '')),
    antibiotic_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_antihistamines VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_antihistamines IN ('yes', 'no', '')),
    antihistamine_name VARCHAR(255) NOT NULL DEFAULT '',
    uses_emollients VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_emollients IN ('yes', 'no', '')),
    emollient_name VARCHAR(255) NOT NULL DEFAULT '',
    phototherapy_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (phototherapy_history IN ('yes', 'no', '')),
    phototherapy_details TEXT NOT NULL DEFAULT '',
    other_medications TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Step 6 Current Medications: topical and systemic treatments for dermatological conditions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.takes_topical_steroids IS
    'Whether the patient currently uses topical corticosteroids.';
COMMENT ON COLUMN assessment_current_medications.topical_steroid_name IS
    'Name of topical steroid (e.g. betamethasone, hydrocortisone).';
COMMENT ON COLUMN assessment_current_medications.topical_steroid_potency IS
    'Potency classification of the topical steroid.';
COMMENT ON COLUMN assessment_current_medications.takes_systemic_immunosuppressants IS
    'Whether the patient takes systemic immunosuppressants (e.g. methotrexate, ciclosporin).';
COMMENT ON COLUMN assessment_current_medications.immunosuppressant_name IS
    'Name of systemic immunosuppressant medication.';
COMMENT ON COLUMN assessment_current_medications.takes_biologics IS
    'Whether the patient takes biologic therapy (e.g. adalimumab, dupilumab).';
COMMENT ON COLUMN assessment_current_medications.biologic_name IS
    'Name of biologic medication.';
COMMENT ON COLUMN assessment_current_medications.takes_retinoids IS
    'Whether the patient takes retinoid therapy (e.g. isotretinoin, acitretin).';
COMMENT ON COLUMN assessment_current_medications.retinoid_name IS
    'Name of retinoid medication.';
COMMENT ON COLUMN assessment_current_medications.takes_antibiotics IS
    'Whether the patient takes antibiotics for skin conditions.';
COMMENT ON COLUMN assessment_current_medications.antibiotic_name IS
    'Name of antibiotic medication.';
COMMENT ON COLUMN assessment_current_medications.takes_antihistamines IS
    'Whether the patient takes antihistamines.';
COMMENT ON COLUMN assessment_current_medications.antihistamine_name IS
    'Name of antihistamine medication.';
COMMENT ON COLUMN assessment_current_medications.uses_emollients IS
    'Whether the patient uses emollients or moisturisers.';
COMMENT ON COLUMN assessment_current_medications.emollient_name IS
    'Name or type of emollient used.';
COMMENT ON COLUMN assessment_current_medications.phototherapy_history IS
    'Whether the patient has had phototherapy (UVB, PUVA).';
COMMENT ON COLUMN assessment_current_medications.phototherapy_details IS
    'Details of phototherapy treatment.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of all other current medications.';
