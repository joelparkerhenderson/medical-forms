-- 06_assessment_best_gaze_visual.sql
-- Best gaze and visual fields section of the stroke assessment (NIHSS items 2-3).

CREATE TABLE assessment_best_gaze_visual (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- NIHSS 2: Best gaze (horizontal eye movements)
    nihss_2_best_gaze INTEGER
        CHECK (nihss_2_best_gaze IS NULL OR (nihss_2_best_gaze >= 0 AND nihss_2_best_gaze <= 2)),

    -- NIHSS 3: Visual fields
    nihss_3_visual_fields INTEGER
        CHECK (nihss_3_visual_fields IS NULL OR (nihss_3_visual_fields >= 0 AND nihss_3_visual_fields <= 3)),

    gaze_deviation_direction VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (gaze_deviation_direction IN ('left', 'right', 'none', '')),
    forced_eye_deviation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (forced_eye_deviation IN ('yes', 'no', '')),
    pupil_left_mm NUMERIC(3,1)
        CHECK (pupil_left_mm IS NULL OR pupil_left_mm >= 0),
    pupil_right_mm NUMERIC(3,1)
        CHECK (pupil_right_mm IS NULL OR pupil_right_mm >= 0),
    pupil_left_reactive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pupil_left_reactive IN ('yes', 'no', '')),
    pupil_right_reactive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pupil_right_reactive IN ('yes', 'no', '')),
    visual_field_deficit_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (visual_field_deficit_type IN ('none', 'partial_hemianopia', 'complete_hemianopia', 'bilateral_hemianopia', '')),
    visual_deficit_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_best_gaze_visual_updated_at
    BEFORE UPDATE ON assessment_best_gaze_visual
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_best_gaze_visual IS
    'Best gaze and visual fields section (NIHSS items 2-3): eye movements, pupil examination, and visual field testing. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_best_gaze_visual.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_best_gaze_visual.nihss_2_best_gaze IS
    'NIHSS 2: 0=normal, 1=partial gaze palsy (abnormal gaze in one or both eyes but no forced deviation), 2=forced deviation or total gaze paresis.';
COMMENT ON COLUMN assessment_best_gaze_visual.nihss_3_visual_fields IS
    'NIHSS 3: 0=no visual loss, 1=partial hemianopia, 2=complete hemianopia, 3=bilateral hemianopia (blind).';
COMMENT ON COLUMN assessment_best_gaze_visual.gaze_deviation_direction IS
    'Direction of gaze deviation if present: left, right, none, or empty string.';
COMMENT ON COLUMN assessment_best_gaze_visual.forced_eye_deviation IS
    'Whether forced eye deviation is present (suggests large hemispheric stroke).';
COMMENT ON COLUMN assessment_best_gaze_visual.pupil_left_mm IS
    'Left pupil diameter in millimetres.';
COMMENT ON COLUMN assessment_best_gaze_visual.pupil_right_mm IS
    'Right pupil diameter in millimetres.';
COMMENT ON COLUMN assessment_best_gaze_visual.pupil_left_reactive IS
    'Whether left pupil is reactive to light.';
COMMENT ON COLUMN assessment_best_gaze_visual.pupil_right_reactive IS
    'Whether right pupil is reactive to light.';
COMMENT ON COLUMN assessment_best_gaze_visual.visual_field_deficit_type IS
    'Type of visual field deficit: none, partial_hemianopia, complete_hemianopia, bilateral_hemianopia, or empty string.';
COMMENT ON COLUMN assessment_best_gaze_visual.visual_deficit_notes IS
    'Free-text notes on visual examination findings.';
