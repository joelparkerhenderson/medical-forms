-- 05_assessment_visual_acuity.sql
-- Visual acuity section of the ophthalmology assessment.

CREATE TABLE assessment_visual_acuity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    va_right_unaided VARCHAR(20) NOT NULL DEFAULT '',
    va_left_unaided VARCHAR(20) NOT NULL DEFAULT '',
    va_right_corrected VARCHAR(20) NOT NULL DEFAULT '',
    va_left_corrected VARCHAR(20) NOT NULL DEFAULT '',
    va_right_pinhole VARCHAR(20) NOT NULL DEFAULT '',
    va_left_pinhole VARCHAR(20) NOT NULL DEFAULT '',
    va_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (va_method IN ('snellen', 'logmar', 'etdrs', 'counting-fingers', 'hand-movements', 'light-perception', '')),
    near_vision_right VARCHAR(20) NOT NULL DEFAULT '',
    near_vision_left VARCHAR(20) NOT NULL DEFAULT '',
    current_spectacle_prescription TEXT NOT NULL DEFAULT '',
    refraction_right TEXT NOT NULL DEFAULT '',
    refraction_left TEXT NOT NULL DEFAULT '',
    auto_refraction_right TEXT NOT NULL DEFAULT '',
    auto_refraction_left TEXT NOT NULL DEFAULT '',
    colour_vision VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (colour_vision IN ('normal', 'deficient', 'not-tested', '')),
    colour_vision_details TEXT NOT NULL DEFAULT '',
    visual_acuity_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_visual_acuity_updated_at
    BEFORE UPDATE ON assessment_visual_acuity
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_visual_acuity IS
    'Visual acuity section: unaided, corrected, and pinhole acuity for both eyes, refraction, and colour vision. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_visual_acuity.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_visual_acuity.va_right_unaided IS
    'Unaided visual acuity of the right eye (e.g. 6/6, 6/12, 20/20).';
COMMENT ON COLUMN assessment_visual_acuity.va_left_unaided IS
    'Unaided visual acuity of the left eye.';
COMMENT ON COLUMN assessment_visual_acuity.va_right_corrected IS
    'Best corrected visual acuity of the right eye.';
COMMENT ON COLUMN assessment_visual_acuity.va_left_corrected IS
    'Best corrected visual acuity of the left eye.';
COMMENT ON COLUMN assessment_visual_acuity.va_right_pinhole IS
    'Pinhole visual acuity of the right eye.';
COMMENT ON COLUMN assessment_visual_acuity.va_left_pinhole IS
    'Pinhole visual acuity of the left eye.';
COMMENT ON COLUMN assessment_visual_acuity.va_method IS
    'Method used for visual acuity testing: snellen, logmar, etdrs, counting-fingers, hand-movements, light-perception, or empty.';
COMMENT ON COLUMN assessment_visual_acuity.near_vision_right IS
    'Near vision acuity of the right eye (e.g. N5, N8).';
COMMENT ON COLUMN assessment_visual_acuity.near_vision_left IS
    'Near vision acuity of the left eye.';
COMMENT ON COLUMN assessment_visual_acuity.current_spectacle_prescription IS
    'Current spectacle prescription if applicable.';
COMMENT ON COLUMN assessment_visual_acuity.refraction_right IS
    'Subjective refraction result for the right eye.';
COMMENT ON COLUMN assessment_visual_acuity.refraction_left IS
    'Subjective refraction result for the left eye.';
COMMENT ON COLUMN assessment_visual_acuity.auto_refraction_right IS
    'Auto-refraction result for the right eye.';
COMMENT ON COLUMN assessment_visual_acuity.auto_refraction_left IS
    'Auto-refraction result for the left eye.';
COMMENT ON COLUMN assessment_visual_acuity.colour_vision IS
    'Colour vision assessment: normal, deficient, not-tested, or empty.';
COMMENT ON COLUMN assessment_visual_acuity.colour_vision_details IS
    'Details of colour vision deficiency if present (e.g. Ishihara plate results).';
COMMENT ON COLUMN assessment_visual_acuity.visual_acuity_notes IS
    'Additional clinician notes on visual acuity assessment.';
