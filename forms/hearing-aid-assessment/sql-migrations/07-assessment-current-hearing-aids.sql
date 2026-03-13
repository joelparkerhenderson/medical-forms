-- 07_assessment_current_hearing_aids.sql
-- Current hearing aids section of the hearing aid assessment.

CREATE TABLE assessment_current_hearing_aids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    currently_uses_hearing_aids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_uses_hearing_aids IN ('yes', 'no', '')),
    hearing_aid_side VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (hearing_aid_side IN ('left', 'right', 'bilateral', '')),
    hearing_aid_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hearing_aid_type IN ('bte', 'ite', 'itc', 'cic', 'ric', 'baha', 'cochlear-implant', 'other', '')),
    hearing_aid_make VARCHAR(255) NOT NULL DEFAULT '',
    hearing_aid_model VARCHAR(255) NOT NULL DEFAULT '',
    hearing_aid_age_years INTEGER
        CHECK (hearing_aid_age_years IS NULL OR hearing_aid_age_years >= 0),
    daily_usage_hours INTEGER
        CHECK (daily_usage_hours IS NULL OR (daily_usage_hours >= 0 AND daily_usage_hours <= 24)),
    satisfaction_with_current_aid VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (satisfaction_with_current_aid IN ('very-satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very-dissatisfied', '')),
    problems_with_current_aid VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (problems_with_current_aid IN ('yes', 'no', '')),
    problem_details TEXT NOT NULL DEFAULT '',
    previous_hearing_aids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_hearing_aids IN ('yes', 'no', '')),
    previous_aid_details TEXT NOT NULL DEFAULT '',
    uses_assistive_listening_devices VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_assistive_listening_devices IN ('yes', 'no', '')),
    assistive_device_details TEXT NOT NULL DEFAULT '',
    hearing_aid_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_hearing_aids_updated_at
    BEFORE UPDATE ON assessment_current_hearing_aids
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_hearing_aids IS
    'Current hearing aids section: type, usage, satisfaction, and assistive devices. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_hearing_aids.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_hearing_aids.currently_uses_hearing_aids IS
    'Whether the patient currently uses hearing aids: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_hearing_aids.hearing_aid_side IS
    'Which ear(s) have hearing aids: left, right, bilateral, or empty string.';
COMMENT ON COLUMN assessment_current_hearing_aids.hearing_aid_type IS
    'Type of hearing aid: bte, ite, itc, cic, ric, baha, cochlear-implant, other, or empty string.';
COMMENT ON COLUMN assessment_current_hearing_aids.hearing_aid_make IS
    'Manufacturer of the hearing aid.';
COMMENT ON COLUMN assessment_current_hearing_aids.hearing_aid_model IS
    'Model of the hearing aid.';
COMMENT ON COLUMN assessment_current_hearing_aids.hearing_aid_age_years IS
    'Age of the current hearing aid in years, NULL if unanswered.';
COMMENT ON COLUMN assessment_current_hearing_aids.daily_usage_hours IS
    'Average daily hearing aid usage in hours, NULL if unanswered.';
COMMENT ON COLUMN assessment_current_hearing_aids.satisfaction_with_current_aid IS
    'Satisfaction level: very-satisfied, satisfied, neutral, dissatisfied, very-dissatisfied, or empty string.';
COMMENT ON COLUMN assessment_current_hearing_aids.problems_with_current_aid IS
    'Whether there are problems with the current hearing aid: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_hearing_aids.problem_details IS
    'Details of problems with current hearing aid.';
COMMENT ON COLUMN assessment_current_hearing_aids.previous_hearing_aids IS
    'Whether the patient has used hearing aids previously: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_hearing_aids.previous_aid_details IS
    'Details of previous hearing aids.';
COMMENT ON COLUMN assessment_current_hearing_aids.uses_assistive_listening_devices IS
    'Whether the patient uses assistive listening devices: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_hearing_aids.assistive_device_details IS
    'Details of assistive listening devices used.';
COMMENT ON COLUMN assessment_current_hearing_aids.hearing_aid_notes IS
    'Free-text notes on current hearing aids.';
