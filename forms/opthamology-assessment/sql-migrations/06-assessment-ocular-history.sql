-- 06_assessment_ocular_history.sql
-- Ocular history section of the ophthalmology assessment.

CREATE TABLE assessment_ocular_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_glaucoma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_glaucoma IN ('yes', 'no', '')),
    glaucoma_details TEXT NOT NULL DEFAULT '',
    has_cataract VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cataract IN ('yes', 'no', '')),
    cataract_details TEXT NOT NULL DEFAULT '',
    has_macular_degeneration VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_macular_degeneration IN ('yes', 'no', '')),
    macular_degeneration_details TEXT NOT NULL DEFAULT '',
    has_diabetic_retinopathy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetic_retinopathy IN ('yes', 'no', '')),
    diabetic_retinopathy_details TEXT NOT NULL DEFAULT '',
    has_retinal_detachment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_retinal_detachment IN ('yes', 'no', '')),
    retinal_detachment_details TEXT NOT NULL DEFAULT '',
    has_strabismus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_strabismus IN ('yes', 'no', '')),
    strabismus_details TEXT NOT NULL DEFAULT '',
    has_amblyopia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_amblyopia IN ('yes', 'no', '')),
    amblyopia_details TEXT NOT NULL DEFAULT '',
    previous_eye_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_eye_surgery IN ('yes', 'no', '')),
    eye_surgery_details TEXT NOT NULL DEFAULT '',
    previous_eye_trauma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_eye_trauma IN ('yes', 'no', '')),
    eye_trauma_details TEXT NOT NULL DEFAULT '',
    family_eye_history TEXT NOT NULL DEFAULT '',
    contact_lens_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (contact_lens_use IN ('none', 'soft', 'rigid-gas-permeable', 'hybrid', '')),
    contact_lens_details TEXT NOT NULL DEFAULT '',
    ocular_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_ocular_history_updated_at
    BEFORE UPDATE ON assessment_ocular_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_ocular_history IS
    'Ocular history section: previous eye conditions, surgeries, trauma, family history, and contact lens use. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_ocular_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_ocular_history.has_glaucoma IS
    'History of glaucoma: yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.glaucoma_details IS
    'Details of glaucoma history including type and treatment.';
COMMENT ON COLUMN assessment_ocular_history.has_cataract IS
    'History of cataract: yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.cataract_details IS
    'Details of cataract history including type and surgery status.';
COMMENT ON COLUMN assessment_ocular_history.has_macular_degeneration IS
    'History of age-related macular degeneration: yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.macular_degeneration_details IS
    'Details of macular degeneration including type (wet/dry) and treatment.';
COMMENT ON COLUMN assessment_ocular_history.has_diabetic_retinopathy IS
    'History of diabetic retinopathy: yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.diabetic_retinopathy_details IS
    'Details of diabetic retinopathy including grade and treatment.';
COMMENT ON COLUMN assessment_ocular_history.has_retinal_detachment IS
    'History of retinal detachment: yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.retinal_detachment_details IS
    'Details of retinal detachment including eye and treatment.';
COMMENT ON COLUMN assessment_ocular_history.has_strabismus IS
    'History of strabismus (squint): yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.strabismus_details IS
    'Details of strabismus history.';
COMMENT ON COLUMN assessment_ocular_history.has_amblyopia IS
    'History of amblyopia (lazy eye): yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.amblyopia_details IS
    'Details of amblyopia history.';
COMMENT ON COLUMN assessment_ocular_history.previous_eye_surgery IS
    'History of previous eye surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.eye_surgery_details IS
    'Details of previous eye surgeries.';
COMMENT ON COLUMN assessment_ocular_history.previous_eye_trauma IS
    'History of previous eye trauma: yes, no, or empty.';
COMMENT ON COLUMN assessment_ocular_history.eye_trauma_details IS
    'Details of previous eye trauma.';
COMMENT ON COLUMN assessment_ocular_history.family_eye_history IS
    'Relevant family eye disease history (glaucoma, AMD, etc.).';
COMMENT ON COLUMN assessment_ocular_history.contact_lens_use IS
    'Type of contact lens use: none, soft, rigid-gas-permeable, hybrid, or empty.';
COMMENT ON COLUMN assessment_ocular_history.contact_lens_details IS
    'Details of contact lens use including wearing schedule.';
COMMENT ON COLUMN assessment_ocular_history.ocular_history_notes IS
    'Additional clinician notes on ocular history.';
