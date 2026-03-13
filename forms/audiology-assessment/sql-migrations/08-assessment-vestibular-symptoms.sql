-- 08_assessment_vestibular_symptoms.sql
-- Vestibular symptoms section of the audiology assessment.

CREATE TABLE assessment_vestibular_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_dizziness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_dizziness IN ('yes', 'no', '')),
    has_vertigo VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_vertigo IN ('yes', 'no', '')),
    vertigo_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (vertigo_type IN ('spinning', 'swaying', 'lightheaded', 'unsteadiness', '')),
    vertigo_duration VARCHAR(50) NOT NULL DEFAULT '',
    vertigo_frequency VARCHAR(30) NOT NULL DEFAULT '',
    vertigo_triggers TEXT NOT NULL DEFAULT '',
    has_balance_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_balance_problems IN ('yes', 'no', '')),
    has_falls VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_falls IN ('yes', 'no', '')),
    falls_frequency VARCHAR(50) NOT NULL DEFAULT '',
    has_nausea_with_dizziness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_nausea_with_dizziness IN ('yes', 'no', '')),
    has_aural_fullness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_aural_fullness IN ('yes', 'no', '')),
    suspected_meniere_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suspected_meniere_disease IN ('yes', 'no', '')),
    vestibular_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_vestibular_symptoms_updated_at
    BEFORE UPDATE ON assessment_vestibular_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_vestibular_symptoms IS
    'Vestibular symptoms section: dizziness, vertigo, balance, and related symptoms. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_vestibular_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_vestibular_symptoms.has_dizziness IS
    'Whether the patient experiences dizziness.';
COMMENT ON COLUMN assessment_vestibular_symptoms.has_vertigo IS
    'Whether the patient experiences true vertigo (sensation of rotation).';
COMMENT ON COLUMN assessment_vestibular_symptoms.vertigo_type IS
    'Type of vertigo: spinning, swaying, lightheaded, unsteadiness, or empty string if unanswered.';
COMMENT ON COLUMN assessment_vestibular_symptoms.vertigo_duration IS
    'Typical duration of vertigo episodes.';
COMMENT ON COLUMN assessment_vestibular_symptoms.vertigo_frequency IS
    'How often vertigo episodes occur.';
COMMENT ON COLUMN assessment_vestibular_symptoms.vertigo_triggers IS
    'Known triggers for vertigo episodes (e.g. head movement, position change).';
COMMENT ON COLUMN assessment_vestibular_symptoms.has_balance_problems IS
    'Whether the patient has balance problems.';
COMMENT ON COLUMN assessment_vestibular_symptoms.has_falls IS
    'Whether the patient has had falls related to balance or dizziness.';
COMMENT ON COLUMN assessment_vestibular_symptoms.falls_frequency IS
    'How often falls occur.';
COMMENT ON COLUMN assessment_vestibular_symptoms.has_nausea_with_dizziness IS
    'Whether the patient experiences nausea associated with dizziness.';
COMMENT ON COLUMN assessment_vestibular_symptoms.has_aural_fullness IS
    'Whether the patient experiences aural fullness (sensation of pressure in the ear).';
COMMENT ON COLUMN assessment_vestibular_symptoms.suspected_meniere_disease IS
    'Whether Meniere disease is suspected (triad of hearing loss, tinnitus, and vertigo with aural fullness).';
COMMENT ON COLUMN assessment_vestibular_symptoms.vestibular_notes IS
    'Additional notes about vestibular symptoms.';
