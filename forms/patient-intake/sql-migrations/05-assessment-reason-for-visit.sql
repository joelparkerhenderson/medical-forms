-- 05_assessment_reason_for_visit.sql
-- Reason for visit section of the patient intake assessment.

CREATE TABLE assessment_reason_for_visit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    visit_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (visit_type IN ('new-patient', 'follow-up', 'urgent', 'routine-check', 'referral', 'other', '')),
    primary_reason TEXT NOT NULL DEFAULT '',
    symptom_onset TEXT NOT NULL DEFAULT '',
    symptom_duration TEXT NOT NULL DEFAULT '',
    symptom_severity INTEGER
        CHECK (symptom_severity IS NULL OR (symptom_severity >= 0 AND symptom_severity <= 10)),
    symptoms_worsening VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (symptoms_worsening IN ('yes', 'no', '')),
    previous_treatment_for_this TEXT NOT NULL DEFAULT '',
    referring_provider VARCHAR(255) NOT NULL DEFAULT '',
    referral_reason TEXT NOT NULL DEFAULT '',
    patient_goals TEXT NOT NULL DEFAULT '',
    reason_for_visit_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_reason_for_visit_updated_at
    BEFORE UPDATE ON assessment_reason_for_visit
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_reason_for_visit IS
    'Reason for visit section: visit type, presenting complaint, symptoms, and referral details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_reason_for_visit.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_reason_for_visit.visit_type IS
    'Type of visit: new-patient, follow-up, urgent, routine-check, referral, other, or empty.';
COMMENT ON COLUMN assessment_reason_for_visit.primary_reason IS
    'Primary reason for the visit in the patient own words.';
COMMENT ON COLUMN assessment_reason_for_visit.symptom_onset IS
    'When the symptoms started.';
COMMENT ON COLUMN assessment_reason_for_visit.symptom_duration IS
    'How long the symptoms have been present.';
COMMENT ON COLUMN assessment_reason_for_visit.symptom_severity IS
    'Severity of symptoms on 0-10 scale (0 = none, 10 = worst possible).';
COMMENT ON COLUMN assessment_reason_for_visit.symptoms_worsening IS
    'Whether symptoms are getting worse: yes, no, or empty.';
COMMENT ON COLUMN assessment_reason_for_visit.previous_treatment_for_this IS
    'Previous treatment received for the current complaint.';
COMMENT ON COLUMN assessment_reason_for_visit.referring_provider IS
    'Name of the referring provider if applicable.';
COMMENT ON COLUMN assessment_reason_for_visit.referral_reason IS
    'Reason for referral if applicable.';
COMMENT ON COLUMN assessment_reason_for_visit.patient_goals IS
    'Patient goals or expectations for the visit.';
COMMENT ON COLUMN assessment_reason_for_visit.reason_for_visit_notes IS
    'Additional notes on the reason for visit.';
