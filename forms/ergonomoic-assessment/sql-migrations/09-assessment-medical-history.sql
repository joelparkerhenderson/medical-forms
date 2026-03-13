-- 09_assessment_medical_history.sql
-- Step 7: Medical history section of the ergonomic assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_previous_msk_injury VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_previous_msk_injury IN ('yes', 'no', '')),
    msk_injury_details TEXT NOT NULL DEFAULT '',
    has_carpal_tunnel VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_carpal_tunnel IN ('yes', 'no', '')),
    has_tennis_elbow VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_tennis_elbow IN ('yes', 'no', '')),
    has_disc_herniation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_disc_herniation IN ('yes', 'no', '')),
    has_arthritis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_arthritis IN ('yes', 'no', '')),
    arthritis_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (arthritis_type IN ('osteoarthritis', 'rheumatoid', 'other', '')),
    has_fibromyalgia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_fibromyalgia IN ('yes', 'no', '')),
    has_osteoporosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_osteoporosis IN ('yes', 'no', '')),
    has_previous_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_previous_surgery IN ('yes', 'no', '')),
    surgery_details TEXT NOT NULL DEFAULT '',
    has_vision_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_vision_problems IN ('yes', 'no', '')),
    wears_corrective_lenses VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wears_corrective_lenses IN ('yes', 'no', '')),
    other_conditions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Step 7 Medical History: musculoskeletal and other conditions relevant to ergonomic risk. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_previous_msk_injury IS
    'Whether the patient has previous musculoskeletal injuries.';
COMMENT ON COLUMN assessment_medical_history.msk_injury_details IS
    'Details of previous musculoskeletal injuries.';
COMMENT ON COLUMN assessment_medical_history.has_carpal_tunnel IS
    'Whether the patient has carpal tunnel syndrome.';
COMMENT ON COLUMN assessment_medical_history.has_tennis_elbow IS
    'Whether the patient has lateral epicondylitis (tennis elbow).';
COMMENT ON COLUMN assessment_medical_history.has_disc_herniation IS
    'Whether the patient has a history of disc herniation.';
COMMENT ON COLUMN assessment_medical_history.has_arthritis IS
    'Whether the patient has arthritis.';
COMMENT ON COLUMN assessment_medical_history.arthritis_type IS
    'Type of arthritis.';
COMMENT ON COLUMN assessment_medical_history.has_fibromyalgia IS
    'Whether the patient has fibromyalgia.';
COMMENT ON COLUMN assessment_medical_history.has_osteoporosis IS
    'Whether the patient has osteoporosis.';
COMMENT ON COLUMN assessment_medical_history.has_previous_surgery IS
    'Whether the patient has had musculoskeletal surgery.';
COMMENT ON COLUMN assessment_medical_history.surgery_details IS
    'Details of previous surgeries.';
COMMENT ON COLUMN assessment_medical_history.has_vision_problems IS
    'Whether the patient has uncorrected vision problems.';
COMMENT ON COLUMN assessment_medical_history.wears_corrective_lenses IS
    'Whether the patient wears glasses or contact lenses.';
COMMENT ON COLUMN assessment_medical_history.other_conditions IS
    'Free-text description of other relevant medical conditions.';
