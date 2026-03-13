-- 12_assessment_family_planning_goals.sql
-- Family planning goals section of the contraception assessment.

CREATE TABLE assessment_family_planning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    desired_number_of_children INTEGER
        CHECK (desired_number_of_children IS NULL OR (desired_number_of_children >= 0 AND desired_number_of_children <= 20)),
    children_already_have INTEGER
        CHECK (children_already_have IS NULL OR (children_already_have >= 0 AND children_already_have <= 20)),
    considering_sterilisation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (considering_sterilisation IN ('yes', 'no', '')),
    sterilisation_discussed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sterilisation_discussed IN ('yes', 'no', '')),
    vasectomy_considered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vasectomy_considered IN ('yes', 'no', '')),
    preconception_counselling_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (preconception_counselling_needed IN ('yes', 'no', '')),
    folic_acid_advised VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (folic_acid_advised IN ('yes', 'no', '')),
    fertility_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fertility_concerns IN ('yes', 'no', '')),
    fertility_concern_details TEXT NOT NULL DEFAULT '',
    method_chosen VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (method_chosen IN ('cocp', 'pop', 'patch', 'ring', 'injection', 'implant', 'cu-iud', 'lng-ius', 'condom-male', 'condom-female', 'diaphragm', 'natural', 'sterilisation', 'undecided', '')),
    method_chosen_details TEXT NOT NULL DEFAULT '',
    follow_up_plan TEXT NOT NULL DEFAULT '',
    family_planning_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_family_planning_goals_updated_at
    BEFORE UPDATE ON assessment_family_planning_goals
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_family_planning_goals IS
    'Family planning goals section: desired family size, sterilisation, preconception, method chosen, follow-up. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_planning_goals.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_planning_goals.desired_number_of_children IS
    'Total number of children desired.';
COMMENT ON COLUMN assessment_family_planning_goals.children_already_have IS
    'Number of children the patient already has.';
COMMENT ON COLUMN assessment_family_planning_goals.considering_sterilisation IS
    'Whether the patient is considering sterilisation: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_planning_goals.sterilisation_discussed IS
    'Whether sterilisation was discussed as an option: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_planning_goals.vasectomy_considered IS
    'Whether partner vasectomy was considered: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_planning_goals.preconception_counselling_needed IS
    'Whether preconception counselling is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_planning_goals.folic_acid_advised IS
    'Whether folic acid supplementation was advised: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_planning_goals.fertility_concerns IS
    'Whether the patient has fertility concerns: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_planning_goals.fertility_concern_details IS
    'Details of fertility concerns.';
COMMENT ON COLUMN assessment_family_planning_goals.method_chosen IS
    'Contraceptive method chosen after consultation: cocp, pop, patch, ring, injection, implant, cu-iud, lng-ius, condom-male, condom-female, diaphragm, natural, sterilisation, undecided, or empty.';
COMMENT ON COLUMN assessment_family_planning_goals.method_chosen_details IS
    'Details of the chosen method including brand and dose.';
COMMENT ON COLUMN assessment_family_planning_goals.follow_up_plan IS
    'Follow-up plan including timing and purpose.';
COMMENT ON COLUMN assessment_family_planning_goals.family_planning_notes IS
    'Additional clinician notes on family planning goals.';
