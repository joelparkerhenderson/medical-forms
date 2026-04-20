-- 08_assessment_staff_attitude.sql
-- Staff attitude and professionalism section of the patient satisfaction survey.

CREATE TABLE assessment_staff_attitude (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    doctor_courtesy INTEGER
        CHECK (doctor_courtesy IS NULL OR (doctor_courtesy >= 1 AND doctor_courtesy <= 5)),
    nurse_courtesy INTEGER
        CHECK (nurse_courtesy IS NULL OR (nurse_courtesy >= 1 AND nurse_courtesy <= 5)),
    reception_courtesy INTEGER
        CHECK (reception_courtesy IS NULL OR (reception_courtesy >= 1 AND reception_courtesy <= 5)),
    respect_for_dignity INTEGER
        CHECK (respect_for_dignity IS NULL OR (respect_for_dignity >= 1 AND respect_for_dignity <= 5)),
    cultural_sensitivity INTEGER
        CHECK (cultural_sensitivity IS NULL OR (cultural_sensitivity >= 1 AND cultural_sensitivity <= 5)),
    emotional_support INTEGER
        CHECK (emotional_support IS NULL OR (emotional_support >= 1 AND emotional_support <= 5)),
    staff_attitude_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_staff_attitude_updated_at
    BEFORE UPDATE ON assessment_staff_attitude
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_staff_attitude IS
    'Staff attitude and professionalism section: courtesy, dignity, cultural sensitivity, and emotional support. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_staff_attitude.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_staff_attitude.doctor_courtesy IS
    'Satisfaction with doctor courtesy and professionalism (1-5 Likert).';
COMMENT ON COLUMN assessment_staff_attitude.nurse_courtesy IS
    'Satisfaction with nurse courtesy and professionalism (1-5 Likert).';
COMMENT ON COLUMN assessment_staff_attitude.reception_courtesy IS
    'Satisfaction with reception staff courtesy (1-5 Likert).';
COMMENT ON COLUMN assessment_staff_attitude.respect_for_dignity IS
    'Satisfaction with respect shown for patient dignity (1-5 Likert).';
COMMENT ON COLUMN assessment_staff_attitude.cultural_sensitivity IS
    'Satisfaction with cultural and religious sensitivity (1-5 Likert).';
COMMENT ON COLUMN assessment_staff_attitude.emotional_support IS
    'Satisfaction with emotional support provided (1-5 Likert).';
COMMENT ON COLUMN assessment_staff_attitude.staff_attitude_notes IS
    'Additional notes about staff attitude and professionalism.';
