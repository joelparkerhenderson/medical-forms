-- 12_assessment_recommendations.sql
-- Recommendations and support plan section of the dyslexia assessment.

CREATE TABLE assessment_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    specialist_teaching VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (specialist_teaching IN ('yes', 'no', '')),
    specialist_teaching_details TEXT NOT NULL DEFAULT '',
    classroom_accommodations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (classroom_accommodations IN ('yes', 'no', '')),
    classroom_accommodations_details TEXT NOT NULL DEFAULT '',
    assistive_technology_recommended VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (assistive_technology_recommended IN ('yes', 'no', '')),
    assistive_technology_recommended_details TEXT NOT NULL DEFAULT '',
    exam_access_recommended VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exam_access_recommended IN ('yes', 'no', '')),
    exam_access_recommended_details TEXT NOT NULL DEFAULT '',
    further_referrals VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (further_referrals IN ('yes', 'no', '')),
    further_referrals_details TEXT NOT NULL DEFAULT '',
    review_date DATE,
    recommendations_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_recommendations_updated_at
    BEFORE UPDATE ON assessment_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_recommendations IS
    'Recommendations and support plan section: specialist teaching, accommodations, technology, exam access, referrals. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_recommendations.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_recommendations.specialist_teaching IS
    'Whether specialist dyslexia teaching is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_recommendations.specialist_teaching_details IS
    'Details of recommended specialist teaching.';
COMMENT ON COLUMN assessment_recommendations.classroom_accommodations IS
    'Whether classroom accommodations are recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_recommendations.classroom_accommodations_details IS
    'Details of recommended classroom accommodations.';
COMMENT ON COLUMN assessment_recommendations.assistive_technology_recommended IS
    'Whether assistive technology is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_recommendations.assistive_technology_recommended_details IS
    'Details of recommended assistive technology.';
COMMENT ON COLUMN assessment_recommendations.exam_access_recommended IS
    'Whether exam access arrangements are recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_recommendations.exam_access_recommended_details IS
    'Details of recommended exam access arrangements.';
COMMENT ON COLUMN assessment_recommendations.further_referrals IS
    'Whether further referrals are recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_recommendations.further_referrals_details IS
    'Details of recommended further referrals.';
COMMENT ON COLUMN assessment_recommendations.review_date IS
    'Recommended review date.';
COMMENT ON COLUMN assessment_recommendations.recommendations_notes IS
    'Additional clinician notes on recommendations and support plan.';
