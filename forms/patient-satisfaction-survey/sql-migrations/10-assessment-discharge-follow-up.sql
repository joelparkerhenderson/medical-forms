-- 10_assessment_discharge_follow_up.sql
-- Discharge and follow-up section of the patient satisfaction survey.

CREATE TABLE assessment_discharge_follow_up (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    discharge_information INTEGER
        CHECK (discharge_information IS NULL OR (discharge_information >= 1 AND discharge_information <= 5)),
    medication_explanation INTEGER
        CHECK (medication_explanation IS NULL OR (medication_explanation >= 1 AND medication_explanation <= 5)),
    follow_up_arrangements INTEGER
        CHECK (follow_up_arrangements IS NULL OR (follow_up_arrangements >= 1 AND follow_up_arrangements <= 5)),
    knew_who_to_contact INTEGER
        CHECK (knew_who_to_contact IS NULL OR (knew_who_to_contact >= 1 AND knew_who_to_contact <= 5)),
    recovery_information INTEGER
        CHECK (recovery_information IS NULL OR (recovery_information >= 1 AND recovery_information <= 5)),
    care_plan_clarity INTEGER
        CHECK (care_plan_clarity IS NULL OR (care_plan_clarity >= 1 AND care_plan_clarity <= 5)),
    discharge_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_discharge_follow_up_updated_at
    BEFORE UPDATE ON assessment_discharge_follow_up
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_discharge_follow_up IS
    'Discharge and follow-up section: discharge information, medication, follow-up plans, and contact information. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_discharge_follow_up.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_discharge_follow_up.discharge_information IS
    'Satisfaction with discharge information provided (1-5 Likert).';
COMMENT ON COLUMN assessment_discharge_follow_up.medication_explanation IS
    'Satisfaction with explanation of medications at discharge (1-5 Likert).';
COMMENT ON COLUMN assessment_discharge_follow_up.follow_up_arrangements IS
    'Satisfaction with follow-up appointment arrangements (1-5 Likert).';
COMMENT ON COLUMN assessment_discharge_follow_up.knew_who_to_contact IS
    'Satisfaction with knowing who to contact after discharge (1-5 Likert).';
COMMENT ON COLUMN assessment_discharge_follow_up.recovery_information IS
    'Satisfaction with information about recovery and self-care (1-5 Likert).';
COMMENT ON COLUMN assessment_discharge_follow_up.care_plan_clarity IS
    'Satisfaction with clarity of ongoing care plan (1-5 Likert).';
COMMENT ON COLUMN assessment_discharge_follow_up.discharge_notes IS
    'Additional notes about discharge and follow-up.';
