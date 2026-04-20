-- 07_assessment_clinical_care_quality.sql
-- Clinical care quality section of the patient satisfaction survey.

CREATE TABLE assessment_clinical_care_quality (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    confidence_in_clinician INTEGER
        CHECK (confidence_in_clinician IS NULL OR (confidence_in_clinician >= 1 AND confidence_in_clinician <= 5)),
    thoroughness_of_examination INTEGER
        CHECK (thoroughness_of_examination IS NULL OR (thoroughness_of_examination >= 1 AND thoroughness_of_examination <= 5)),
    pain_management INTEGER
        CHECK (pain_management IS NULL OR (pain_management >= 1 AND pain_management <= 5)),
    involvement_in_decisions INTEGER
        CHECK (involvement_in_decisions IS NULL OR (involvement_in_decisions >= 1 AND involvement_in_decisions <= 5)),
    privacy_during_examination INTEGER
        CHECK (privacy_during_examination IS NULL OR (privacy_during_examination >= 1 AND privacy_during_examination <= 5)),
    coordination_of_care INTEGER
        CHECK (coordination_of_care IS NULL OR (coordination_of_care >= 1 AND coordination_of_care <= 5)),
    clinical_care_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_clinical_care_quality_updated_at
    BEFORE UPDATE ON assessment_clinical_care_quality
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_clinical_care_quality IS
    'Clinical care quality section: clinician confidence, examination thoroughness, pain management, and care coordination. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_clinical_care_quality.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_clinical_care_quality.confidence_in_clinician IS
    'Satisfaction with confidence and trust in the clinician (1-5 Likert).';
COMMENT ON COLUMN assessment_clinical_care_quality.thoroughness_of_examination IS
    'Satisfaction with thoroughness of clinical examination (1-5 Likert).';
COMMENT ON COLUMN assessment_clinical_care_quality.pain_management IS
    'Satisfaction with pain management and relief (1-5 Likert).';
COMMENT ON COLUMN assessment_clinical_care_quality.involvement_in_decisions IS
    'Satisfaction with involvement in treatment decisions (1-5 Likert).';
COMMENT ON COLUMN assessment_clinical_care_quality.privacy_during_examination IS
    'Satisfaction with privacy during examination and treatment (1-5 Likert).';
COMMENT ON COLUMN assessment_clinical_care_quality.coordination_of_care IS
    'Satisfaction with coordination between different staff and departments (1-5 Likert).';
COMMENT ON COLUMN assessment_clinical_care_quality.clinical_care_notes IS
    'Additional notes about clinical care quality.';
