-- 10_assessment_complications_screening.sql
-- Complications screening section of the assessment.

CREATE TABLE assessment_complications_screening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    retinopathy_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (retinopathy_status IN ('notScreened', 'none', 'background', 'preProliferative', 'proliferative', 'maculopathy', '')),
    last_eye_screening_date DATE,
    neuropathy_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neuropathy_symptoms IN ('yes', 'no', '')),
    monofilament_test VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (monofilament_test IN ('normal', 'abnormal', 'notDone', '')),
    foot_pulses VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (foot_pulses IN ('present', 'diminished', 'absent', 'notAssessed', '')),
    foot_ulcer_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (foot_ulcer_history IN ('yes', 'no', '')),
    ankle_brachial_index NUMERIC(4,2)
        CHECK (ankle_brachial_index IS NULL OR (ankle_brachial_index >= 0 AND ankle_brachial_index <= 3)),
    erectile_dysfunction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (erectile_dysfunction IN ('yes', 'no', 'na', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_complications_screening_updated_at
    BEFORE UPDATE ON assessment_complications_screening
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_complications_screening IS
    'Complications screening section: retinopathy, neuropathy, foot examination, and other complications. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_complications_screening.retinopathy_status IS
    'Retinopathy status: notScreened, none, background, preProliferative, proliferative, or maculopathy.';
COMMENT ON COLUMN assessment_complications_screening.monofilament_test IS
    'Monofilament test result: normal, abnormal, or notDone.';
COMMENT ON COLUMN assessment_complications_screening.foot_pulses IS
    'Foot pulse assessment: present, diminished, absent, or notAssessed.';
COMMENT ON COLUMN assessment_complications_screening.ankle_brachial_index IS
    'Ankle-brachial index measurement.';
