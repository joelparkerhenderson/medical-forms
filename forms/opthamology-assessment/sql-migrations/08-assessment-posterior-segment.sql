-- 08_assessment_posterior_segment.sql
-- Posterior segment examination section of the ophthalmology assessment.

CREATE TABLE assessment_posterior_segment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    vitreous_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vitreous_right IN ('clear', 'cells', 'haemorrhage', 'detachment', 'other', '')),
    vitreous_right_details TEXT NOT NULL DEFAULT '',
    vitreous_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vitreous_left IN ('clear', 'cells', 'haemorrhage', 'detachment', 'other', '')),
    vitreous_left_details TEXT NOT NULL DEFAULT '',
    optic_disc_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (optic_disc_right IN ('normal', 'swollen', 'pale', 'cupped', 'other', '')),
    optic_disc_right_details TEXT NOT NULL DEFAULT '',
    optic_disc_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (optic_disc_left IN ('normal', 'swollen', 'pale', 'cupped', 'other', '')),
    optic_disc_left_details TEXT NOT NULL DEFAULT '',
    cup_disc_ratio_right NUMERIC(3,2)
        CHECK (cup_disc_ratio_right IS NULL OR (cup_disc_ratio_right >= 0 AND cup_disc_ratio_right <= 1)),
    cup_disc_ratio_left NUMERIC(3,2)
        CHECK (cup_disc_ratio_left IS NULL OR (cup_disc_ratio_left >= 0 AND cup_disc_ratio_left <= 1)),
    macula_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (macula_right IN ('normal', 'drusen', 'oedema', 'haemorrhage', 'atrophy', 'other', '')),
    macula_right_details TEXT NOT NULL DEFAULT '',
    macula_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (macula_left IN ('normal', 'drusen', 'oedema', 'haemorrhage', 'atrophy', 'other', '')),
    macula_left_details TEXT NOT NULL DEFAULT '',
    retinal_vessels_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (retinal_vessels_right IN ('normal', 'attenuated', 'tortuous', 'neovascularisation', 'other', '')),
    retinal_vessels_right_details TEXT NOT NULL DEFAULT '',
    retinal_vessels_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (retinal_vessels_left IN ('normal', 'attenuated', 'tortuous', 'neovascularisation', 'other', '')),
    retinal_vessels_left_details TEXT NOT NULL DEFAULT '',
    peripheral_retina_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (peripheral_retina_right IN ('normal', 'degeneration', 'tear', 'detachment', 'other', '')),
    peripheral_retina_right_details TEXT NOT NULL DEFAULT '',
    peripheral_retina_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (peripheral_retina_left IN ('normal', 'degeneration', 'tear', 'detachment', 'other', '')),
    peripheral_retina_left_details TEXT NOT NULL DEFAULT '',
    dilation_used VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dilation_used IN ('yes', 'no', '')),
    dilating_agent VARCHAR(100) NOT NULL DEFAULT '',
    posterior_segment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_posterior_segment_updated_at
    BEFORE UPDATE ON assessment_posterior_segment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_posterior_segment IS
    'Posterior segment examination section: vitreous, optic disc, macula, retinal vessels, and peripheral retina. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_posterior_segment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_posterior_segment.vitreous_right IS
    'Right eye vitreous: clear, cells, haemorrhage, detachment, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.vitreous_left IS
    'Left eye vitreous: clear, cells, haemorrhage, detachment, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.optic_disc_right IS
    'Right eye optic disc: normal, swollen, pale, cupped, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.optic_disc_left IS
    'Left eye optic disc: normal, swollen, pale, cupped, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.cup_disc_ratio_right IS
    'Right eye cup-to-disc ratio (0.0 to 1.0).';
COMMENT ON COLUMN assessment_posterior_segment.cup_disc_ratio_left IS
    'Left eye cup-to-disc ratio (0.0 to 1.0).';
COMMENT ON COLUMN assessment_posterior_segment.macula_right IS
    'Right eye macula: normal, drusen, oedema, haemorrhage, atrophy, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.macula_left IS
    'Left eye macula: normal, drusen, oedema, haemorrhage, atrophy, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.retinal_vessels_right IS
    'Right eye retinal vessels: normal, attenuated, tortuous, neovascularisation, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.retinal_vessels_left IS
    'Left eye retinal vessels: normal, attenuated, tortuous, neovascularisation, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.peripheral_retina_right IS
    'Right eye peripheral retina: normal, degeneration, tear, detachment, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.peripheral_retina_left IS
    'Left eye peripheral retina: normal, degeneration, tear, detachment, other, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.dilation_used IS
    'Whether pupil dilation was used for the examination: yes, no, or empty.';
COMMENT ON COLUMN assessment_posterior_segment.dilating_agent IS
    'Dilating agent used (e.g. tropicamide 1%, phenylephrine 2.5%).';
COMMENT ON COLUMN assessment_posterior_segment.posterior_segment_notes IS
    'Additional clinician notes on posterior segment examination.';
