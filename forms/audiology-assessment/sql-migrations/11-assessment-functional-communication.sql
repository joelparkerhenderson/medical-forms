-- 11_assessment_functional_communication.sql
-- Functional and communication section of the audiology assessment.

CREATE TABLE assessment_functional_communication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    communication_difficulty_rating VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (communication_difficulty_rating IN ('none', 'mild', 'moderate', 'severe', 'profound', '')),
    impact_on_work VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_work IN ('none', 'mild', 'moderate', 'severe', '')),
    impact_on_social_life VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_social_life IN ('none', 'mild', 'moderate', 'severe', '')),
    impact_on_relationships VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_relationships IN ('none', 'mild', 'moderate', 'severe', '')),
    impact_on_mental_health VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_mental_health IN ('none', 'mild', 'moderate', 'severe', '')),
    uses_hearing_aid VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_hearing_aid IN ('yes', 'no', '')),
    hearing_aid_type VARCHAR(50) NOT NULL DEFAULT '',
    hearing_aid_satisfaction VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hearing_aid_satisfaction IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', '')),
    uses_assistive_devices VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_assistive_devices IN ('yes', 'no', '')),
    assistive_device_details TEXT NOT NULL DEFAULT '',
    communication_strategies_used TEXT NOT NULL DEFAULT '',
    patient_goals TEXT NOT NULL DEFAULT '',
    referral_recommendations TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_communication_updated_at
    BEFORE UPDATE ON assessment_functional_communication
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_communication IS
    'Functional and communication section: impact of hearing loss on daily life, current hearing aids, assistive devices, and patient goals. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_communication.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_communication.communication_difficulty_rating IS
    'Overall self-rated communication difficulty: none, mild, moderate, severe, profound, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_communication.impact_on_work IS
    'Degree of impact on work: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_communication.impact_on_social_life IS
    'Degree of impact on social life: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_communication.impact_on_relationships IS
    'Degree of impact on relationships: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_communication.impact_on_mental_health IS
    'Degree of impact on mental health: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_communication.uses_hearing_aid IS
    'Whether the patient currently uses hearing aids.';
COMMENT ON COLUMN assessment_functional_communication.hearing_aid_type IS
    'Type of hearing aid (e.g. BTE, ITE, RIC, CROS).';
COMMENT ON COLUMN assessment_functional_communication.hearing_aid_satisfaction IS
    'Satisfaction with current hearing aids: very_satisfied, satisfied, neutral, dissatisfied, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_communication.uses_assistive_devices IS
    'Whether the patient uses other assistive listening devices.';
COMMENT ON COLUMN assessment_functional_communication.assistive_device_details IS
    'Details of assistive listening devices used (e.g. FM system, loop system, captioning).';
COMMENT ON COLUMN assessment_functional_communication.communication_strategies_used IS
    'Communication strategies currently used (e.g. lip reading, preferred seating).';
COMMENT ON COLUMN assessment_functional_communication.patient_goals IS
    'Patient goals for hearing rehabilitation.';
COMMENT ON COLUMN assessment_functional_communication.referral_recommendations IS
    'Recommended referrals (e.g. ENT, hearing aid fitting, tinnitus therapy, vestibular rehabilitation).';
