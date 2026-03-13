-- 09_assessment_visual_field_pupils.sql
-- Visual field and pupils section of the ophthalmology assessment.

CREATE TABLE assessment_visual_field_pupils (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    confrontation_field_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (confrontation_field_right IN ('full', 'restricted', 'not-tested', '')),
    confrontation_field_right_details TEXT NOT NULL DEFAULT '',
    confrontation_field_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (confrontation_field_left IN ('full', 'restricted', 'not-tested', '')),
    confrontation_field_left_details TEXT NOT NULL DEFAULT '',
    formal_perimetry_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (formal_perimetry_performed IN ('yes', 'no', '')),
    perimetry_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (perimetry_type IN ('humphrey', 'goldmann', 'octopus', 'frequency-doubling', 'other', '')),
    perimetry_right_result TEXT NOT NULL DEFAULT '',
    perimetry_left_result TEXT NOT NULL DEFAULT '',
    mean_deviation_right NUMERIC(5,2),
    mean_deviation_left NUMERIC(5,2),
    pupil_right_size_mm NUMERIC(3,1)
        CHECK (pupil_right_size_mm IS NULL OR (pupil_right_size_mm >= 1 AND pupil_right_size_mm <= 10)),
    pupil_left_size_mm NUMERIC(3,1)
        CHECK (pupil_left_size_mm IS NULL OR (pupil_left_size_mm >= 1 AND pupil_left_size_mm <= 10)),
    pupil_right_shape VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pupil_right_shape IN ('round', 'irregular', 'fixed', '')),
    pupil_left_shape VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pupil_left_shape IN ('round', 'irregular', 'fixed', '')),
    pupil_right_reaction VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pupil_right_reaction IN ('brisk', 'sluggish', 'fixed', 'not-tested', '')),
    pupil_left_reaction VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pupil_left_reaction IN ('brisk', 'sluggish', 'fixed', 'not-tested', '')),
    rapd VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (rapd IN ('none', 'right', 'left', 'not-tested', '')),
    ocular_motility VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ocular_motility IN ('full', 'restricted', 'not-tested', '')),
    ocular_motility_details TEXT NOT NULL DEFAULT '',
    visual_field_pupils_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_visual_field_pupils_updated_at
    BEFORE UPDATE ON assessment_visual_field_pupils
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_visual_field_pupils IS
    'Visual field and pupils section: confrontation fields, formal perimetry, pupil examination, and ocular motility. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_visual_field_pupils.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_visual_field_pupils.confrontation_field_right IS
    'Right eye confrontation visual field: full, restricted, not-tested, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.confrontation_field_left IS
    'Left eye confrontation visual field: full, restricted, not-tested, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.formal_perimetry_performed IS
    'Whether formal perimetry was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.perimetry_type IS
    'Type of perimetry: humphrey, goldmann, octopus, frequency-doubling, other, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.perimetry_right_result IS
    'Summary of right eye perimetry results.';
COMMENT ON COLUMN assessment_visual_field_pupils.perimetry_left_result IS
    'Summary of left eye perimetry results.';
COMMENT ON COLUMN assessment_visual_field_pupils.mean_deviation_right IS
    'Mean deviation value for right eye automated perimetry (dB).';
COMMENT ON COLUMN assessment_visual_field_pupils.mean_deviation_left IS
    'Mean deviation value for left eye automated perimetry (dB).';
COMMENT ON COLUMN assessment_visual_field_pupils.pupil_right_size_mm IS
    'Right pupil size in millimetres.';
COMMENT ON COLUMN assessment_visual_field_pupils.pupil_left_size_mm IS
    'Left pupil size in millimetres.';
COMMENT ON COLUMN assessment_visual_field_pupils.pupil_right_shape IS
    'Right pupil shape: round, irregular, fixed, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.pupil_left_shape IS
    'Left pupil shape: round, irregular, fixed, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.pupil_right_reaction IS
    'Right pupil light reaction: brisk, sluggish, fixed, not-tested, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.pupil_left_reaction IS
    'Left pupil light reaction: brisk, sluggish, fixed, not-tested, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.rapd IS
    'Relative afferent pupillary defect: none, right, left, not-tested, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.ocular_motility IS
    'Ocular motility assessment: full, restricted, not-tested, or empty.';
COMMENT ON COLUMN assessment_visual_field_pupils.ocular_motility_details IS
    'Details of restricted ocular motility if present.';
COMMENT ON COLUMN assessment_visual_field_pupils.visual_field_pupils_notes IS
    'Additional clinician notes on visual field and pupil examination.';
