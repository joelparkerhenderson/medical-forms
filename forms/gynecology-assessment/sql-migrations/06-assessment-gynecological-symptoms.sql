-- 06_assessment_gynecological_symptoms.sql
-- Gynaecological symptoms section of the gynaecology assessment.

CREATE TABLE assessment_gynecological_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    pelvic_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pelvic_pain IN ('yes', 'no', '')),
    pelvic_pain_severity INTEGER
        CHECK (pelvic_pain_severity IS NULL OR (pelvic_pain_severity >= 1 AND pelvic_pain_severity <= 10)),
    pelvic_pain_location VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (pelvic_pain_location IN ('central', 'left', 'right', 'bilateral', '')),
    dyspareunia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dyspareunia IN ('yes', 'no', '')),
    dyspareunia_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (dyspareunia_type IN ('superficial', 'deep', '')),
    vaginal_discharge VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vaginal_discharge IN ('yes', 'no', '')),
    discharge_characteristics VARCHAR(100) NOT NULL DEFAULT '',
    vulval_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vulval_symptoms IN ('yes', 'no', '')),
    vulval_symptom_details TEXT NOT NULL DEFAULT '',
    urinary_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urinary_symptoms IN ('yes', 'no', '')),
    urinary_symptom_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (urinary_symptom_type IN ('frequency', 'urgency', 'incontinence', 'dysuria', 'multiple', '')),
    pelvic_organ_prolapse_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pelvic_organ_prolapse_symptoms IN ('yes', 'no', '')),
    prolapse_details TEXT NOT NULL DEFAULT '',
    bloating VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bloating IN ('yes', 'no', '')),
    bowel_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bowel_symptoms IN ('yes', 'no', '')),
    bowel_symptom_details TEXT NOT NULL DEFAULT '',
    symptom_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_gynecological_symptoms_updated_at
    BEFORE UPDATE ON assessment_gynecological_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gynecological_symptoms IS
    'Gynaecological symptoms section: pelvic pain, dyspareunia, discharge, vulval symptoms, urinary symptoms, and prolapse. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_gynecological_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_gynecological_symptoms.pelvic_pain IS
    'Whether pelvic pain is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.pelvic_pain_severity IS
    'Pelvic pain severity from 1 (mild) to 10 (severe), NULL if unanswered.';
COMMENT ON COLUMN assessment_gynecological_symptoms.pelvic_pain_location IS
    'Location of pelvic pain: central, left, right, bilateral, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.dyspareunia IS
    'Whether painful intercourse (dyspareunia) is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.dyspareunia_type IS
    'Type of dyspareunia: superficial, deep, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.vaginal_discharge IS
    'Whether abnormal vaginal discharge is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.discharge_characteristics IS
    'Characteristics of discharge (colour, odour, consistency).';
COMMENT ON COLUMN assessment_gynecological_symptoms.vulval_symptoms IS
    'Whether vulval symptoms are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.vulval_symptom_details IS
    'Details of vulval symptoms (e.g. itching, pain, lesions).';
COMMENT ON COLUMN assessment_gynecological_symptoms.urinary_symptoms IS
    'Whether urinary symptoms are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.urinary_symptom_type IS
    'Type of urinary symptom: frequency, urgency, incontinence, dysuria, multiple, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.pelvic_organ_prolapse_symptoms IS
    'Whether pelvic organ prolapse symptoms are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.prolapse_details IS
    'Details of pelvic organ prolapse symptoms.';
COMMENT ON COLUMN assessment_gynecological_symptoms.bloating IS
    'Whether persistent bloating is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.bowel_symptoms IS
    'Whether associated bowel symptoms are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gynecological_symptoms.bowel_symptom_details IS
    'Details of bowel symptoms.';
COMMENT ON COLUMN assessment_gynecological_symptoms.symptom_notes IS
    'Free-text notes on gynaecological symptoms.';
