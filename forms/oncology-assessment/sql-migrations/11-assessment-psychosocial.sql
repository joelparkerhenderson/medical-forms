-- 11_assessment_psychosocial.sql
-- Psychosocial section of the oncology assessment.

CREATE TABLE assessment_psychosocial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    anxiety_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anxiety_level IN ('none', 'mild', 'moderate', 'severe', '')),
    depression_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (depression_level IN ('none', 'mild', 'moderate', 'severe', '')),
    distress_thermometer_score INTEGER
        CHECK (distress_thermometer_score IS NULL OR (distress_thermometer_score >= 0 AND distress_thermometer_score <= 10)),
    coping_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (coping_ability IN ('coping-well', 'some-difficulty', 'significant-difficulty', 'not-coping', '')),
    social_support VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (social_support IN ('strong', 'adequate', 'limited', 'none', '')),
    financial_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (financial_concerns IN ('yes', 'no', '')),
    financial_concerns_details TEXT NOT NULL DEFAULT '',
    employment_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_impact IN ('no-impact', 'reduced-hours', 'unable-to-work', 'not-applicable', '')),
    relationship_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (relationship_impact IN ('no-impact', 'minor-impact', 'significant-impact', '')),
    spiritual_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (spiritual_concerns IN ('yes', 'no', '')),
    spiritual_concerns_details TEXT NOT NULL DEFAULT '',
    psychological_support_in_place VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (psychological_support_in_place IN ('yes', 'no', '')),
    psychological_support_details TEXT NOT NULL DEFAULT '',
    advance_care_planning_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (advance_care_planning_discussed IN ('yes', 'no', '')),
    psychosocial_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_psychosocial_updated_at
    BEFORE UPDATE ON assessment_psychosocial
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychosocial IS
    'Psychosocial section: anxiety, depression, distress, coping, support, and advance care planning. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_psychosocial.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_psychosocial.anxiety_level IS
    'Anxiety level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_psychosocial.depression_level IS
    'Depression level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_psychosocial.distress_thermometer_score IS
    'NCCN Distress Thermometer score (0 = no distress, 10 = extreme distress).';
COMMENT ON COLUMN assessment_psychosocial.coping_ability IS
    'Patient coping ability: coping-well, some-difficulty, significant-difficulty, not-coping, or empty.';
COMMENT ON COLUMN assessment_psychosocial.social_support IS
    'Level of social support: strong, adequate, limited, none, or empty.';
COMMENT ON COLUMN assessment_psychosocial.financial_concerns IS
    'Whether the patient has financial concerns related to their cancer: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychosocial.financial_concerns_details IS
    'Details of financial concerns.';
COMMENT ON COLUMN assessment_psychosocial.employment_impact IS
    'Impact of cancer on employment: no-impact, reduced-hours, unable-to-work, not-applicable, or empty.';
COMMENT ON COLUMN assessment_psychosocial.relationship_impact IS
    'Impact on relationships: no-impact, minor-impact, significant-impact, or empty.';
COMMENT ON COLUMN assessment_psychosocial.spiritual_concerns IS
    'Whether the patient has spiritual or existential concerns: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychosocial.spiritual_concerns_details IS
    'Details of spiritual or existential concerns.';
COMMENT ON COLUMN assessment_psychosocial.psychological_support_in_place IS
    'Whether psychological support is currently in place: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychosocial.psychological_support_details IS
    'Details of current psychological support services.';
COMMENT ON COLUMN assessment_psychosocial.advance_care_planning_discussed IS
    'Whether advance care planning has been discussed: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychosocial.psychosocial_notes IS
    'Additional clinician notes on psychosocial assessment.';
