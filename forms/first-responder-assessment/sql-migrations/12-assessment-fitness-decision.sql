-- 12_assessment_fitness_decision.sql
-- Overall fitness decision section of the first responder assessment.

CREATE TABLE assessment_fitness_decision (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    overall_fitness VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (overall_fitness IN ('fit-for-duty', 'fit-with-restrictions', 'temporarily-unfit', 'permanently-unfit', '')),
    restrictions_details TEXT NOT NULL DEFAULT '',
    reassessment_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reassessment_required IN ('yes', 'no', '')),
    reassessment_date DATE,
    remedial_actions TEXT NOT NULL DEFAULT '',
    referrals_required TEXT NOT NULL DEFAULT '',
    assessor_name VARCHAR(255) NOT NULL DEFAULT '',
    assessor_role VARCHAR(255) NOT NULL DEFAULT '',
    assessor_registration VARCHAR(100) NOT NULL DEFAULT '',
    assessment_date DATE,
    countersignature_name VARCHAR(255) NOT NULL DEFAULT '',
    countersignature_date DATE,
    fitness_decision_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_fitness_decision_updated_at
    BEFORE UPDATE ON assessment_fitness_decision
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_fitness_decision IS
    'Overall fitness decision section: fitness outcome, restrictions, reassessment, and assessor details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_fitness_decision.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_fitness_decision.overall_fitness IS
    'Overall fitness decision: fit-for-duty, fit-with-restrictions, temporarily-unfit, permanently-unfit, or empty.';
COMMENT ON COLUMN assessment_fitness_decision.restrictions_details IS
    'Details of any restrictions applied.';
COMMENT ON COLUMN assessment_fitness_decision.reassessment_required IS
    'Whether reassessment is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_fitness_decision.reassessment_date IS
    'Date of next required reassessment.';
COMMENT ON COLUMN assessment_fitness_decision.remedial_actions IS
    'Details of remedial actions required.';
COMMENT ON COLUMN assessment_fitness_decision.referrals_required IS
    'Details of referrals required (e.g. occupational health, psychology).';
COMMENT ON COLUMN assessment_fitness_decision.assessor_name IS
    'Name of the assessor completing the assessment.';
COMMENT ON COLUMN assessment_fitness_decision.assessor_role IS
    'Role of the assessor.';
COMMENT ON COLUMN assessment_fitness_decision.assessor_registration IS
    'Registration number of the assessor.';
COMMENT ON COLUMN assessment_fitness_decision.assessment_date IS
    'Date the assessment was completed.';
COMMENT ON COLUMN assessment_fitness_decision.countersignature_name IS
    'Name of the countersigning officer.';
COMMENT ON COLUMN assessment_fitness_decision.countersignature_date IS
    'Date of the countersignature.';
COMMENT ON COLUMN assessment_fitness_decision.fitness_decision_notes IS
    'Additional notes on the overall fitness decision.';
