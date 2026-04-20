-- 05_assessment_pain_assessment.sql
-- Pain assessment section of the endometriosis assessment.

CREATE TABLE assessment_pain_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_pelvic_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_pelvic_pain IN ('yes', 'no', '')),
    pelvic_pain_severity INTEGER
        CHECK (pelvic_pain_severity IS NULL OR (pelvic_pain_severity >= 0 AND pelvic_pain_severity <= 10)),
    pelvic_pain_character VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (pelvic_pain_character IN ('cramping', 'stabbing', 'burning', 'aching', 'dragging', 'shooting', 'other', '')),
    pelvic_pain_location VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (pelvic_pain_location IN ('central', 'left-sided', 'right-sided', 'bilateral', 'diffuse', 'other', '')),
    pelvic_pain_timing VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (pelvic_pain_timing IN ('menstrual', 'premenstrual', 'ovulatory', 'constant', 'intermittent', '')),
    dyspareunia VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dyspareunia IN ('none', 'superficial', 'deep', 'both', '')),
    dyspareunia_severity INTEGER
        CHECK (dyspareunia_severity IS NULL OR (dyspareunia_severity >= 0 AND dyspareunia_severity <= 10)),
    dyschezia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dyschezia IN ('yes', 'no', '')),
    dyschezia_cyclical VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dyschezia_cyclical IN ('yes', 'no', '')),
    back_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (back_pain IN ('yes', 'no', '')),
    leg_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (leg_pain IN ('yes', 'no', '')),
    pain_worse_with_activity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_worse_with_activity IN ('yes', 'no', '')),
    pain_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_pain_assessment_updated_at
    BEFORE UPDATE ON assessment_pain_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_pain_assessment IS
    'Pain assessment section: pelvic pain characteristics, dyspareunia, dyschezia. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_pain_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_pain_assessment.has_pelvic_pain IS
    'Whether the patient experiences pelvic pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.pelvic_pain_severity IS
    'Visual analogue scale 0-10 for pelvic pain severity.';
COMMENT ON COLUMN assessment_pain_assessment.pelvic_pain_character IS
    'Character of pelvic pain: cramping, stabbing, burning, aching, dragging, shooting, other, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.pelvic_pain_location IS
    'Location of pelvic pain: central, left-sided, right-sided, bilateral, diffuse, other, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.pelvic_pain_timing IS
    'Timing of pelvic pain relative to menstrual cycle: menstrual, premenstrual, ovulatory, constant, intermittent, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.dyspareunia IS
    'Pain during intercourse: none, superficial, deep, both, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.dyspareunia_severity IS
    'Visual analogue scale 0-10 for dyspareunia severity.';
COMMENT ON COLUMN assessment_pain_assessment.dyschezia IS
    'Pain on defecation: yes, no, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.dyschezia_cyclical IS
    'Whether dyschezia worsens with menstruation: yes, no, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.back_pain IS
    'Whether the patient experiences associated back pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.leg_pain IS
    'Whether the patient experiences associated leg pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.pain_worse_with_activity IS
    'Whether pain worsens with physical activity: yes, no, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.pain_notes IS
    'Additional clinician notes on pain assessment.';
