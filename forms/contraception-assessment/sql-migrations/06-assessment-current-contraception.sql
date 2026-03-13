-- 06_assessment_current_contraception.sql
-- Current contraception section of the contraception assessment.

CREATE TABLE assessment_current_contraception (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    currently_using_contraception VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_using_contraception IN ('yes', 'no', '')),
    current_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (current_method IN ('cocp', 'pop', 'patch', 'ring', 'injection', 'implant', 'cu-iud', 'lng-ius', 'condom-male', 'condom-female', 'diaphragm', 'natural', 'none', 'other', '')),
    current_method_details TEXT NOT NULL DEFAULT '',
    current_method_duration_months INTEGER
        CHECK (current_method_duration_months IS NULL OR current_method_duration_months >= 0),
    satisfaction_with_current VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (satisfaction_with_current IN ('satisfied', 'dissatisfied', 'neutral', '')),
    reason_for_change TEXT NOT NULL DEFAULT '',
    side_effects_experienced TEXT NOT NULL DEFAULT '',
    previous_methods_tried TEXT NOT NULL DEFAULT '',
    previous_method_problems TEXT NOT NULL DEFAULT '',
    emergency_contraception_used VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (emergency_contraception_used IN ('yes', 'no', '')),
    emergency_contraception_details TEXT NOT NULL DEFAULT '',
    current_contraception_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_contraception_updated_at
    BEFORE UPDATE ON assessment_current_contraception
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_contraception IS
    'Current contraception section: current method, satisfaction, side effects, previous methods. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_contraception.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_contraception.currently_using_contraception IS
    'Whether the patient is currently using contraception: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_contraception.current_method IS
    'Current contraceptive method: cocp, pop, patch, ring, injection, implant, cu-iud, lng-ius, condom-male, condom-female, diaphragm, natural, none, other, or empty.';
COMMENT ON COLUMN assessment_current_contraception.current_method_details IS
    'Details of current method including brand name and dose.';
COMMENT ON COLUMN assessment_current_contraception.current_method_duration_months IS
    'Duration of current method use in months.';
COMMENT ON COLUMN assessment_current_contraception.satisfaction_with_current IS
    'Satisfaction with current method: satisfied, dissatisfied, neutral, or empty.';
COMMENT ON COLUMN assessment_current_contraception.reason_for_change IS
    'Reason for seeking a change in contraception.';
COMMENT ON COLUMN assessment_current_contraception.side_effects_experienced IS
    'Side effects experienced with current method.';
COMMENT ON COLUMN assessment_current_contraception.previous_methods_tried IS
    'List of previous contraceptive methods tried.';
COMMENT ON COLUMN assessment_current_contraception.previous_method_problems IS
    'Problems experienced with previous methods.';
COMMENT ON COLUMN assessment_current_contraception.emergency_contraception_used IS
    'Whether emergency contraception has been used: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_contraception.emergency_contraception_details IS
    'Details of emergency contraception use including dates and type.';
COMMENT ON COLUMN assessment_current_contraception.current_contraception_notes IS
    'Additional clinician notes on current contraception.';
