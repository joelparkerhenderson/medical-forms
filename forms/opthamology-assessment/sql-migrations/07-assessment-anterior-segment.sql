-- 07_assessment_anterior_segment.sql
-- Anterior segment examination section of the ophthalmology assessment.

CREATE TABLE assessment_anterior_segment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    lids_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lids_right IN ('normal', 'abnormal', 'not-examined', '')),
    lids_right_details TEXT NOT NULL DEFAULT '',
    lids_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lids_left IN ('normal', 'abnormal', 'not-examined', '')),
    lids_left_details TEXT NOT NULL DEFAULT '',
    conjunctiva_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (conjunctiva_right IN ('normal', 'injected', 'chemosis', 'other', '')),
    conjunctiva_right_details TEXT NOT NULL DEFAULT '',
    conjunctiva_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (conjunctiva_left IN ('normal', 'injected', 'chemosis', 'other', '')),
    conjunctiva_left_details TEXT NOT NULL DEFAULT '',
    cornea_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cornea_right IN ('clear', 'oedema', 'opacity', 'staining', 'other', '')),
    cornea_right_details TEXT NOT NULL DEFAULT '',
    cornea_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cornea_left IN ('clear', 'oedema', 'opacity', 'staining', 'other', '')),
    cornea_left_details TEXT NOT NULL DEFAULT '',
    anterior_chamber_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anterior_chamber_right IN ('deep-quiet', 'shallow', 'cells', 'flare', 'hypopyon', '')),
    anterior_chamber_right_details TEXT NOT NULL DEFAULT '',
    anterior_chamber_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anterior_chamber_left IN ('deep-quiet', 'shallow', 'cells', 'flare', 'hypopyon', '')),
    anterior_chamber_left_details TEXT NOT NULL DEFAULT '',
    iris_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (iris_right IN ('normal', 'abnormal', 'not-examined', '')),
    iris_right_details TEXT NOT NULL DEFAULT '',
    iris_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (iris_left IN ('normal', 'abnormal', 'not-examined', '')),
    iris_left_details TEXT NOT NULL DEFAULT '',
    lens_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lens_right IN ('clear', 'cataract', 'pseudophakic', 'aphakic', '')),
    lens_right_details TEXT NOT NULL DEFAULT '',
    lens_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lens_left IN ('clear', 'cataract', 'pseudophakic', 'aphakic', '')),
    lens_left_details TEXT NOT NULL DEFAULT '',
    iop_right_mmhg NUMERIC(4,1)
        CHECK (iop_right_mmhg IS NULL OR (iop_right_mmhg >= 0 AND iop_right_mmhg <= 80)),
    iop_left_mmhg NUMERIC(4,1)
        CHECK (iop_left_mmhg IS NULL OR (iop_left_mmhg >= 0 AND iop_left_mmhg <= 80)),
    iop_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (iop_method IN ('goldmann', 'non-contact', 'icare', 'tono-pen', 'palpation', '')),
    iop_time TIME,
    anterior_segment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_anterior_segment_updated_at
    BEFORE UPDATE ON assessment_anterior_segment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anterior_segment IS
    'Anterior segment examination section: lids, conjunctiva, cornea, anterior chamber, iris, lens, and intraocular pressure. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_anterior_segment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_anterior_segment.lids_right IS
    'Right eye lid examination: normal, abnormal, not-examined, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.lids_left IS
    'Left eye lid examination: normal, abnormal, not-examined, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.conjunctiva_right IS
    'Right eye conjunctiva: normal, injected, chemosis, other, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.conjunctiva_left IS
    'Left eye conjunctiva: normal, injected, chemosis, other, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.cornea_right IS
    'Right eye cornea: clear, oedema, opacity, staining, other, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.cornea_left IS
    'Left eye cornea: clear, oedema, opacity, staining, other, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.anterior_chamber_right IS
    'Right eye anterior chamber: deep-quiet, shallow, cells, flare, hypopyon, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.anterior_chamber_left IS
    'Left eye anterior chamber: deep-quiet, shallow, cells, flare, hypopyon, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.iris_right IS
    'Right eye iris examination: normal, abnormal, not-examined, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.iris_left IS
    'Left eye iris examination: normal, abnormal, not-examined, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.lens_right IS
    'Right eye lens status: clear, cataract, pseudophakic, aphakic, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.lens_left IS
    'Left eye lens status: clear, cataract, pseudophakic, aphakic, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.iop_right_mmhg IS
    'Intraocular pressure of the right eye in mmHg.';
COMMENT ON COLUMN assessment_anterior_segment.iop_left_mmhg IS
    'Intraocular pressure of the left eye in mmHg.';
COMMENT ON COLUMN assessment_anterior_segment.iop_method IS
    'Method used for IOP measurement: goldmann, non-contact, icare, tono-pen, palpation, or empty.';
COMMENT ON COLUMN assessment_anterior_segment.iop_time IS
    'Time of day when IOP was measured (relevant for diurnal variation).';
COMMENT ON COLUMN assessment_anterior_segment.anterior_segment_notes IS
    'Additional clinician notes on anterior segment examination.';
