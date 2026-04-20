-- 09_assessment_anaesthetic.sql
-- Anaesthetic assessment section of the bone marrow donation assessment.

CREATE TABLE assessment_anaesthetic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    asa_grade VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asa_grade IN ('I', 'II', 'III', 'IV', '')),
    previous_anaesthetic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_anaesthetic IN ('yes', 'no', '')),
    anaesthetic_complications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anaesthetic_complications IN ('yes', 'no', '')),
    complication_details TEXT NOT NULL DEFAULT '',
    family_anaesthetic_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_anaesthetic_problems IN ('yes', 'no', '')),
    family_problem_details TEXT NOT NULL DEFAULT '',
    mallampati_score VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mallampati_score IN ('I', 'II', 'III', 'IV', '')),
    airway_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (airway_concerns IN ('yes', 'no', '')),
    airway_details TEXT NOT NULL DEFAULT '',
    nil_by_mouth_confirmed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nil_by_mouth_confirmed IN ('yes', 'no', '')),
    smoking_status VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'ex', 'never', '')),
    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'occasional', 'moderate', 'heavy', '')),
    anaesthetic_plan VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anaesthetic_plan IN ('general', 'regional', 'sedation', '')),
    anaesthetic_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_anaesthetic_updated_at
    BEFORE UPDATE ON assessment_anaesthetic
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anaesthetic IS
    'Anaesthetic assessment section: ASA grade, airway assessment, previous anaesthetic history, anaesthetic plan. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_anaesthetic.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_anaesthetic.asa_grade IS
    'ASA physical status classification: I, II, III, IV, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.previous_anaesthetic IS
    'Whether donor has had previous anaesthetics: yes, no, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.anaesthetic_complications IS
    'Whether there were complications with previous anaesthetics: yes, no, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.family_anaesthetic_problems IS
    'Whether family members have had anaesthetic problems (e.g. malignant hyperthermia): yes, no, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.mallampati_score IS
    'Mallampati airway classification: I, II, III, IV, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.airway_concerns IS
    'Whether there are airway concerns: yes, no, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.nil_by_mouth_confirmed IS
    'Whether nil-by-mouth status is confirmed pre-procedure: yes, no, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.smoking_status IS
    'Smoking status: current, ex, never, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.alcohol_use IS
    'Alcohol consumption: none, occasional, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.anaesthetic_plan IS
    'Planned anaesthetic type: general, regional, sedation, or empty.';
COMMENT ON COLUMN assessment_anaesthetic.anaesthetic_notes IS
    'Additional clinician notes on anaesthetic assessment.';
