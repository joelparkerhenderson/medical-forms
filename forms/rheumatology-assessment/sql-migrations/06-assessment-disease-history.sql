-- 06_assessment_disease_history.sql
-- Disease history section of the rheumatology assessment.

CREATE TABLE assessment_disease_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    diagnosis VARCHAR(100) NOT NULL DEFAULT ''
        CHECK (diagnosis IN ('rheumatoid_arthritis', 'psoriatic_arthritis', 'ankylosing_spondylitis', 'systemic_lupus_erythematosus', 'gout', 'osteoarthritis', 'other', '')),
    diagnosis_other TEXT NOT NULL DEFAULT '',
    diagnosis_date DATE,
    disease_duration_years INTEGER
        CHECK (disease_duration_years IS NULL OR disease_duration_years >= 0),
    rheumatoid_factor_positive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rheumatoid_factor_positive IN ('yes', 'no', '')),
    anti_ccp_positive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anti_ccp_positive IN ('yes', 'no', '')),
    previous_dmard_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_dmard_use IN ('yes', 'no', '')),
    previous_dmard_details TEXT NOT NULL DEFAULT '',
    previous_biologic_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_biologic_use IN ('yes', 'no', '')),
    previous_biologic_details TEXT NOT NULL DEFAULT '',
    joint_surgery_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (joint_surgery_history IN ('yes', 'no', '')),
    joint_surgery_details TEXT NOT NULL DEFAULT '',
    flare_frequency VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (flare_frequency IN ('rare', 'occasional', 'frequent', 'constant', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_disease_history_updated_at
    BEFORE UPDATE ON assessment_disease_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_disease_history IS
    'Disease history section: rheumatological diagnosis, serology, and prior treatment history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_disease_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_disease_history.diagnosis IS
    'Primary rheumatological diagnosis.';
COMMENT ON COLUMN assessment_disease_history.diagnosis_other IS
    'Free-text diagnosis if "other" is selected.';
COMMENT ON COLUMN assessment_disease_history.diagnosis_date IS
    'Date of initial diagnosis.';
COMMENT ON COLUMN assessment_disease_history.disease_duration_years IS
    'Duration of disease in years since diagnosis.';
COMMENT ON COLUMN assessment_disease_history.rheumatoid_factor_positive IS
    'Whether rheumatoid factor (RF) is positive: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_disease_history.anti_ccp_positive IS
    'Whether anti-cyclic citrullinated peptide (anti-CCP) antibody is positive.';
COMMENT ON COLUMN assessment_disease_history.previous_dmard_use IS
    'Whether patient has previously used DMARDs (disease-modifying antirheumatic drugs).';
COMMENT ON COLUMN assessment_disease_history.previous_dmard_details IS
    'Details of previous DMARD use including names, durations, and reasons for stopping.';
COMMENT ON COLUMN assessment_disease_history.previous_biologic_use IS
    'Whether patient has previously used biologic agents.';
COMMENT ON COLUMN assessment_disease_history.previous_biologic_details IS
    'Details of previous biologic agent use.';
COMMENT ON COLUMN assessment_disease_history.joint_surgery_history IS
    'Whether patient has had previous joint surgery.';
COMMENT ON COLUMN assessment_disease_history.joint_surgery_details IS
    'Details of previous joint surgeries.';
COMMENT ON COLUMN assessment_disease_history.flare_frequency IS
    'Frequency of disease flares: rare, occasional, frequent, constant, or empty string if unanswered.';
