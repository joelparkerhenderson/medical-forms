-- 04_assessment_symptom_overview.sql
-- Symptom overview section of the MCAS assessment.

CREATE TABLE assessment_symptom_overview (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    symptom_onset_date DATE,
    symptom_duration VARCHAR(50) NOT NULL DEFAULT '',
    symptom_pattern VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (symptom_pattern IN ('episodic', 'chronic', 'progressive', 'relapsing-remitting', '')),
    symptom_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (symptom_frequency IN ('daily', 'weekly', 'monthly', 'sporadic', '')),
    worst_symptom_description TEXT NOT NULL DEFAULT '',
    overall_severity INTEGER
        CHECK (overall_severity IS NULL OR (overall_severity >= 0 AND overall_severity <= 10)),
    previous_mcas_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_mcas_diagnosis IN ('yes', 'no', '')),
    previous_mastocytosis_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_mastocytosis_diagnosis IN ('yes', 'no', '')),
    family_history_mast_cell VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_mast_cell IN ('yes', 'no', '')),
    family_history_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_symptom_overview_updated_at
    BEFORE UPDATE ON assessment_symptom_overview
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_symptom_overview IS
    'Symptom overview section: onset, duration, pattern, and prior mast cell diagnosis history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_symptom_overview.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_symptom_overview.symptom_onset_date IS
    'Approximate date when MCAS symptoms first appeared.';
COMMENT ON COLUMN assessment_symptom_overview.symptom_duration IS
    'Duration of the current symptom episode.';
COMMENT ON COLUMN assessment_symptom_overview.symptom_pattern IS
    'Temporal pattern: episodic, chronic, progressive, relapsing-remitting, or empty string.';
COMMENT ON COLUMN assessment_symptom_overview.symptom_frequency IS
    'How often symptoms occur: daily, weekly, monthly, sporadic, or empty string.';
COMMENT ON COLUMN assessment_symptom_overview.worst_symptom_description IS
    'Patient description of their most severe or troublesome symptom.';
COMMENT ON COLUMN assessment_symptom_overview.overall_severity IS
    'Overall symptom severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_symptom_overview.previous_mcas_diagnosis IS
    'Whether the patient has a prior MCAS diagnosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_symptom_overview.previous_mastocytosis_diagnosis IS
    'Whether the patient has a prior mastocytosis diagnosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_symptom_overview.family_history_mast_cell IS
    'Whether there is a family history of mast cell disorders: yes, no, or empty string.';
COMMENT ON COLUMN assessment_symptom_overview.family_history_details IS
    'Free-text details about family history of mast cell disorders.';
