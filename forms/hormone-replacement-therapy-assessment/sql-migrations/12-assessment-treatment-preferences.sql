-- 12_assessment_treatment_preferences.sql
-- Treatment preferences section of the HRT assessment.

CREATE TABLE assessment_treatment_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_hrt_route VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (preferred_hrt_route IN ('oral', 'transdermal-patch', 'transdermal-gel', 'vaginal', 'implant', 'no-preference', '')),
    has_uterus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_uterus IN ('yes', 'no', '')),
    combined_hrt_appropriate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (combined_hrt_appropriate IN ('yes', 'no', '')),
    preferred_regimen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (preferred_regimen IN ('continuous-combined', 'sequential', 'no-preference', '')),
    interested_in_testosterone VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interested_in_testosterone IN ('yes', 'no', '')),
    testosterone_details TEXT NOT NULL DEFAULT '',
    interested_in_vaginal_oestrogen VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interested_in_vaginal_oestrogen IN ('yes', 'no', '')),
    non_hormonal_alternatives_considered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (non_hormonal_alternatives_considered IN ('yes', 'no', '')),
    non_hormonal_details TEXT NOT NULL DEFAULT '',
    concerns_about_hrt TEXT NOT NULL DEFAULT '',
    duration_expectation VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (duration_expectation IN ('short-term', 'medium-term', 'long-term', 'unsure', '')),
    follow_up_preference VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (follow_up_preference IN ('3-months', '6-months', '12-months', '')),
    informed_consent_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (informed_consent_discussed IN ('yes', 'no', '')),
    patient_information_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_information_provided IN ('yes', 'no', '')),
    treatment_preference_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_treatment_preferences_updated_at
    BEFORE UPDATE ON assessment_treatment_preferences
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatment_preferences IS
    'Treatment preferences section: HRT route, regimen, testosterone, non-hormonal alternatives, and consent. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_treatment_preferences.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_treatment_preferences.preferred_hrt_route IS
    'Preferred HRT route: oral, transdermal-patch, transdermal-gel, vaginal, implant, no-preference, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.has_uterus IS
    'Whether the patient has a uterus (determines need for progesterone): yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.combined_hrt_appropriate IS
    'Whether combined HRT (oestrogen + progesterone) is appropriate: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.preferred_regimen IS
    'Preferred HRT regimen: continuous-combined, sequential, no-preference, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.interested_in_testosterone IS
    'Whether the patient is interested in testosterone supplementation: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.testosterone_details IS
    'Details of testosterone interest (e.g. for libido, energy).';
COMMENT ON COLUMN assessment_treatment_preferences.interested_in_vaginal_oestrogen IS
    'Whether the patient is interested in vaginal oestrogen: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.non_hormonal_alternatives_considered IS
    'Whether non-hormonal alternatives have been considered: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.non_hormonal_details IS
    'Details of non-hormonal alternatives considered (e.g. CBT, SSRIs, clonidine).';
COMMENT ON COLUMN assessment_treatment_preferences.concerns_about_hrt IS
    'Free-text description of patient concerns about HRT.';
COMMENT ON COLUMN assessment_treatment_preferences.duration_expectation IS
    'Expected duration of HRT use: short-term, medium-term, long-term, unsure, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.follow_up_preference IS
    'Preferred follow-up interval: 3-months, 6-months, 12-months, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.informed_consent_discussed IS
    'Whether informed consent has been discussed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.patient_information_provided IS
    'Whether patient information leaflets were provided: yes, no, or empty string.';
COMMENT ON COLUMN assessment_treatment_preferences.treatment_preference_notes IS
    'Free-text notes on treatment preferences.';
