-- 10_assessment_extinction_inattention.sql
-- Extinction and inattention section of the stroke assessment (NIHSS item 11).

CREATE TABLE assessment_extinction_inattention (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- NIHSS 11: Extinction and inattention (neglect)
    nihss_11_extinction_inattention INTEGER
        CHECK (nihss_11_extinction_inattention IS NULL OR (nihss_11_extinction_inattention >= 0 AND nihss_11_extinction_inattention <= 2)),

    visual_neglect VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (visual_neglect IN ('left', 'right', 'none', '')),
    tactile_neglect VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (tactile_neglect IN ('left', 'right', 'none', '')),
    auditory_neglect VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (auditory_neglect IN ('left', 'right', 'none', '')),
    anosognosia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anosognosia IN ('yes', 'no', '')),
    line_bisection_abnormal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (line_bisection_abnormal IN ('yes', 'no', '')),
    neglect_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_extinction_inattention_updated_at
    BEFORE UPDATE ON assessment_extinction_inattention
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_extinction_inattention IS
    'Extinction and inattention section (NIHSS item 11): spatial neglect assessment across multiple modalities. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_extinction_inattention.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_extinction_inattention.nihss_11_extinction_inattention IS
    'NIHSS 11: 0=no abnormality, 1=inattention or extinction to one modality, 2=profound inattention or extinction to more than one modality.';
COMMENT ON COLUMN assessment_extinction_inattention.visual_neglect IS
    'Side of visual neglect: left, right, none, or empty string.';
COMMENT ON COLUMN assessment_extinction_inattention.tactile_neglect IS
    'Side of tactile neglect (double simultaneous stimulation): left, right, none, or empty string.';
COMMENT ON COLUMN assessment_extinction_inattention.auditory_neglect IS
    'Side of auditory neglect: left, right, none, or empty string.';
COMMENT ON COLUMN assessment_extinction_inattention.anosognosia IS
    'Whether anosognosia (unawareness of deficit) is present.';
COMMENT ON COLUMN assessment_extinction_inattention.line_bisection_abnormal IS
    'Whether line bisection test is abnormal.';
COMMENT ON COLUMN assessment_extinction_inattention.neglect_notes IS
    'Free-text notes on neglect examination findings.';
