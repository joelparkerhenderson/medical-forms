-- 05_assessment_developmental_milestones.sql
-- Developmental milestones section of the pediatric assessment.

CREATE TABLE assessment_developmental_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gross_motor_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (gross_motor_status IN ('age-appropriate', 'delayed', 'advanced', 'concern', '')),
    gross_motor_details TEXT NOT NULL DEFAULT '',
    fine_motor_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (fine_motor_status IN ('age-appropriate', 'delayed', 'advanced', 'concern', '')),
    fine_motor_details TEXT NOT NULL DEFAULT '',
    speech_language_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (speech_language_status IN ('age-appropriate', 'delayed', 'advanced', 'concern', '')),
    speech_language_details TEXT NOT NULL DEFAULT '',
    social_emotional_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (social_emotional_status IN ('age-appropriate', 'delayed', 'advanced', 'concern', '')),
    social_emotional_details TEXT NOT NULL DEFAULT '',
    cognitive_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognitive_status IN ('age-appropriate', 'delayed', 'advanced', 'concern', '')),
    cognitive_details TEXT NOT NULL DEFAULT '',
    self_care_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (self_care_status IN ('age-appropriate', 'delayed', 'advanced', 'concern', '')),
    self_care_details TEXT NOT NULL DEFAULT '',
    developmental_screening_tool VARCHAR(50) NOT NULL DEFAULT '',
    developmental_screening_score INTEGER,
    previous_developmental_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_developmental_concerns IN ('yes', 'no', '')),
    previous_concern_details TEXT NOT NULL DEFAULT '',
    early_intervention_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (early_intervention_referral IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_developmental_milestones_updated_at
    BEFORE UPDATE ON assessment_developmental_milestones
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_developmental_milestones IS
    'Developmental milestones section: motor, speech, social-emotional, cognitive, and self-care domains. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_developmental_milestones.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_developmental_milestones.gross_motor_status IS
    'Gross motor development status: age-appropriate, delayed, advanced, concern, or empty.';
COMMENT ON COLUMN assessment_developmental_milestones.fine_motor_status IS
    'Fine motor development status: age-appropriate, delayed, advanced, concern, or empty.';
COMMENT ON COLUMN assessment_developmental_milestones.speech_language_status IS
    'Speech and language development status: age-appropriate, delayed, advanced, concern, or empty.';
COMMENT ON COLUMN assessment_developmental_milestones.social_emotional_status IS
    'Social-emotional development status: age-appropriate, delayed, advanced, concern, or empty.';
COMMENT ON COLUMN assessment_developmental_milestones.cognitive_status IS
    'Cognitive development status: age-appropriate, delayed, advanced, concern, or empty.';
COMMENT ON COLUMN assessment_developmental_milestones.self_care_status IS
    'Self-care skills (toileting, dressing, feeding) status: age-appropriate, delayed, advanced, concern, or empty.';
COMMENT ON COLUMN assessment_developmental_milestones.developmental_screening_tool IS
    'Name of developmental screening instrument used (e.g. ASQ-3, Denver II, PEDS).';
COMMENT ON COLUMN assessment_developmental_milestones.developmental_screening_score IS
    'Numeric score from the developmental screening tool, if applicable.';
COMMENT ON COLUMN assessment_developmental_milestones.previous_developmental_concerns IS
    'Whether there have been previous developmental concerns raised.';
COMMENT ON COLUMN assessment_developmental_milestones.early_intervention_referral IS
    'Whether an early intervention referral has been made.';
