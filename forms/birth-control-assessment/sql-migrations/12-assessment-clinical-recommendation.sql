-- 12_assessment_clinical_recommendation.sql
-- Clinical recommendation section of the birth control assessment.

CREATE TABLE assessment_clinical_recommendation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    recommended_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (recommended_method IN ('coc', 'pop', 'implant', 'injection', 'iud', 'ius', 'patch', 'ring', 'barrier', 'natural', 'sterilisation', 'none', '')),
    alternative_methods TEXT NOT NULL DEFAULT '',
    methods_contraindicated TEXT NOT NULL DEFAULT '',
    counselling_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (counselling_provided IN ('yes', 'no', '')),
    counselling_topics TEXT NOT NULL DEFAULT '',
    follow_up_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (follow_up_required IN ('yes', 'no', '')),
    follow_up_interval VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (follow_up_interval IN ('2-weeks', '6-weeks', '3-months', '6-months', '12-months', '')),
    referral_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (referral_required IN ('yes', 'no', '')),
    referral_details TEXT NOT NULL DEFAULT '',
    clinical_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_clinical_recommendation_updated_at
    BEFORE UPDATE ON assessment_clinical_recommendation
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_clinical_recommendation IS
    'Clinical recommendation section: recommended method, contraindicated methods, counselling, and follow-up. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_clinical_recommendation.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_clinical_recommendation.recommended_method IS
    'Clinician recommended contraceptive method.';
COMMENT ON COLUMN assessment_clinical_recommendation.alternative_methods IS
    'Alternative methods discussed.';
COMMENT ON COLUMN assessment_clinical_recommendation.methods_contraindicated IS
    'Methods that are contraindicated for this patient.';
COMMENT ON COLUMN assessment_clinical_recommendation.counselling_provided IS
    'Whether contraceptive counselling was provided: yes, no, or empty.';
COMMENT ON COLUMN assessment_clinical_recommendation.counselling_topics IS
    'Topics covered in counselling.';
COMMENT ON COLUMN assessment_clinical_recommendation.follow_up_required IS
    'Whether follow-up is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_clinical_recommendation.follow_up_interval IS
    'Recommended follow-up interval.';
COMMENT ON COLUMN assessment_clinical_recommendation.referral_required IS
    'Whether referral to specialist is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_clinical_recommendation.referral_details IS
    'Details of referral if required.';
COMMENT ON COLUMN assessment_clinical_recommendation.clinical_notes IS
    'Additional clinical notes and recommendations.';
