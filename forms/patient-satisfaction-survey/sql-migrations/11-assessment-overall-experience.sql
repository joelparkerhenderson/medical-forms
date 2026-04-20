-- 11_assessment_overall_experience.sql
-- Overall experience section of the patient satisfaction survey.

CREATE TABLE assessment_overall_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    overall_satisfaction INTEGER
        CHECK (overall_satisfaction IS NULL OR (overall_satisfaction >= 1 AND overall_satisfaction <= 5)),
    would_recommend INTEGER
        CHECK (would_recommend IS NULL OR (would_recommend >= 1 AND would_recommend <= 5)),
    met_expectations INTEGER
        CHECK (met_expectations IS NULL OR (met_expectations >= 1 AND met_expectations <= 5)),
    felt_safe INTEGER
        CHECK (felt_safe IS NULL OR (felt_safe >= 1 AND felt_safe <= 5)),
    would_return INTEGER
        CHECK (would_return IS NULL OR (would_return >= 1 AND would_return <= 5)),
    nhs_rating INTEGER
        CHECK (nhs_rating IS NULL OR (nhs_rating >= 1 AND nhs_rating <= 10)),
    overall_experience_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_overall_experience_updated_at
    BEFORE UPDATE ON assessment_overall_experience
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_overall_experience IS
    'Overall experience section: overall satisfaction, recommendation likelihood, expectations, and safety. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_overall_experience.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_overall_experience.overall_satisfaction IS
    'Overall satisfaction with the visit (1-5 Likert).';
COMMENT ON COLUMN assessment_overall_experience.would_recommend IS
    'Likelihood of recommending this service to others (1-5 Likert).';
COMMENT ON COLUMN assessment_overall_experience.met_expectations IS
    'Whether the visit met expectations (1-5 Likert).';
COMMENT ON COLUMN assessment_overall_experience.felt_safe IS
    'Whether the patient felt safe during the visit (1-5 Likert).';
COMMENT ON COLUMN assessment_overall_experience.would_return IS
    'Whether the patient would return to this service (1-5 Likert).';
COMMENT ON COLUMN assessment_overall_experience.nhs_rating IS
    'Overall NHS Friends and Family Test style rating (1-10 scale).';
COMMENT ON COLUMN assessment_overall_experience.overall_experience_notes IS
    'Additional notes about overall experience.';
