-- 12_assessment_treatment_planning.sql
-- Treatment planning section of the endometriosis assessment.

CREATE TABLE assessment_treatment_planning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    treatment_goals TEXT NOT NULL DEFAULT '',
    preferred_approach VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (preferred_approach IN ('conservative', 'medical', 'surgical', 'combined', 'fertility-focused', '')),
    surgery_considered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (surgery_considered IN ('yes', 'no', '')),
    surgery_type_considered VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (surgery_type_considered IN ('diagnostic-laparoscopy', 'excision', 'ablation', 'hysterectomy', 'other', '')),
    fertility_preservation_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fertility_preservation_needed IN ('yes', 'no', '')),
    mdt_referral_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mdt_referral_needed IN ('yes', 'no', '')),
    pain_management_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pain_management_referral IN ('yes', 'no', '')),
    psychology_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (psychology_referral IN ('yes', 'no', '')),
    physiotherapy_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (physiotherapy_referral IN ('yes', 'no', '')),
    fertility_clinic_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fertility_clinic_referral IN ('yes', 'no', '')),
    imaging_requested VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (imaging_requested IN ('none', 'transvaginal-us', 'mri-pelvis', 'both', '')),
    follow_up_interval VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (follow_up_interval IN ('2-weeks', '4-weeks', '3-months', '6-months', '12-months', '')),
    planning_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatment_planning_updated_at
    BEFORE UPDATE ON assessment_treatment_planning
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatment_planning IS
    'Treatment planning section: goals, approach, referrals, and follow-up. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatment_planning.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatment_planning.treatment_goals IS
    'Patient stated treatment goals and priorities.';
COMMENT ON COLUMN assessment_treatment_planning.preferred_approach IS
    'Preferred treatment approach: conservative, medical, surgical, combined, fertility-focused, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.surgery_considered IS
    'Whether surgery is being considered: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.surgery_type_considered IS
    'Type of surgery considered: diagnostic-laparoscopy, excision, ablation, hysterectomy, other, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.fertility_preservation_needed IS
    'Whether fertility preservation is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.mdt_referral_needed IS
    'Whether MDT (multidisciplinary team) referral is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.pain_management_referral IS
    'Whether pain management referral is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.psychology_referral IS
    'Whether psychology/counselling referral is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.physiotherapy_referral IS
    'Whether physiotherapy referral is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.fertility_clinic_referral IS
    'Whether fertility clinic referral is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.imaging_requested IS
    'Imaging requested: none, transvaginal-us, mri-pelvis, both, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.follow_up_interval IS
    'Recommended follow-up interval: 2-weeks, 4-weeks, 3-months, 6-months, 12-months, or empty.';
COMMENT ON COLUMN assessment_treatment_planning.planning_notes IS
    'Additional clinician notes on treatment planning.';
