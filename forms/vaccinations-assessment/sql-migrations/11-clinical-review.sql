-- 11_clinical_review.sql
-- Clinical review section (Step 10).

CREATE TABLE clinical_review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    post_vaccination_observation SMALLINT CHECK (post_vaccination_observation IS NULL OR post_vaccination_observation BETWEEN 1 AND 5),
    immediate_reaction VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (immediate_reaction IN ('yes', 'no', '')),
    reaction_details TEXT NOT NULL DEFAULT '',
    next_dose_due DATE,
    catch_up_schedule_needed VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (catch_up_schedule_needed IN ('yes', 'no', '')),
    referral_needed VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (referral_needed IN ('yes', 'no', '')),
    clinician_notes TEXT NOT NULL DEFAULT '',
    reviewing_clinician VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_clinical_review_updated_at
    BEFORE UPDATE ON clinical_review
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clinical_review IS
    'Clinical review including post-vaccination observation and referral needs. One-to-one child of assessment.';
