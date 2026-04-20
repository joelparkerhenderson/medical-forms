-- 08_assessment_communication_skills.sql
-- Communication skills section of the first responder assessment.

CREATE TABLE assessment_communication_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    patient_communication VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (patient_communication IN ('not-competent', 'developing', 'competent', 'expert', '')),
    relative_communication VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (relative_communication IN ('not-competent', 'developing', 'competent', 'expert', '')),
    handover_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (handover_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    documentation_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (documentation_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    multidisciplinary_teamwork VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (multidisciplinary_teamwork IN ('not-competent', 'developing', 'competent', 'expert', '')),
    conflict_resolution VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (conflict_resolution IN ('not-competent', 'developing', 'competent', 'expert', '')),
    safeguarding_awareness VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (safeguarding_awareness IN ('not-competent', 'developing', 'competent', 'expert', '')),
    breaking_bad_news VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (breaking_bad_news IN ('not-competent', 'developing', 'competent', 'expert', '')),
    communication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_communication_skills_updated_at
    BEFORE UPDATE ON assessment_communication_skills
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_communication_skills IS
    'Communication skills section: patient/relative communication, handover, documentation, teamwork, and safeguarding. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_communication_skills.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_communication_skills.patient_communication IS
    'Patient communication competency level.';
COMMENT ON COLUMN assessment_communication_skills.relative_communication IS
    'Relative and bystander communication competency level.';
COMMENT ON COLUMN assessment_communication_skills.handover_competency IS
    'Clinical handover (SBAR/ATMIST) competency level.';
COMMENT ON COLUMN assessment_communication_skills.documentation_competency IS
    'Clinical documentation and record keeping competency level.';
COMMENT ON COLUMN assessment_communication_skills.multidisciplinary_teamwork IS
    'Multidisciplinary team working competency level.';
COMMENT ON COLUMN assessment_communication_skills.conflict_resolution IS
    'Conflict resolution and de-escalation competency level.';
COMMENT ON COLUMN assessment_communication_skills.safeguarding_awareness IS
    'Safeguarding awareness competency level.';
COMMENT ON COLUMN assessment_communication_skills.breaking_bad_news IS
    'Breaking bad news competency level.';
COMMENT ON COLUMN assessment_communication_skills.communication_notes IS
    'Additional notes on communication skills assessment.';
