-- 11_assessment_previous_treatment.sql
-- Previous treatment history section of the substance abuse assessment.

CREATE TABLE assessment_previous_treatment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_treatment IN ('yes', 'no', '')),
    number_of_treatment_episodes INTEGER
        CHECK (number_of_treatment_episodes IS NULL OR number_of_treatment_episodes >= 0),
    previous_detox VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_detox IN ('yes', 'no', '')),
    detox_setting VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (detox_setting IN ('inpatient', 'outpatient', 'community', '')),
    previous_rehab VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_rehab IN ('yes', 'no', '')),
    rehab_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (rehab_type IN ('residential', 'day-programme', 'outpatient', '')),
    previous_counselling VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_counselling IN ('yes', 'no', '')),
    counselling_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (counselling_type IN ('cbt', 'motivational-interviewing', 'group-therapy', '12-step', 'other', '')),
    previous_medication_assisted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_medication_assisted IN ('yes', 'no', '')),
    mat_medication VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (mat_medication IN ('methadone', 'buprenorphine', 'naltrexone', 'acamprosate', 'disulfiram', 'other', '')),
    self_help_groups VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (self_help_groups IN ('yes', 'no', '')),
    self_help_group_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (self_help_group_type IN ('aa', 'na', 'smart-recovery', 'other', '')),
    longest_period_abstinent VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (longest_period_abstinent IN ('less-1-month', '1-3-months', '3-6-months', '6-12-months', 'greater-1-year', '')),
    relapse_triggers TEXT NOT NULL DEFAULT '',
    treatment_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_previous_treatment_updated_at
    BEFORE UPDATE ON assessment_previous_treatment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_previous_treatment IS
    'Previous treatment history section: detox, rehab, counselling, medication-assisted treatment, and self-help. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_previous_treatment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_previous_treatment.previous_treatment IS
    'Whether the patient has had previous substance abuse treatment: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.number_of_treatment_episodes IS
    'Total number of previous treatment episodes.';
COMMENT ON COLUMN assessment_previous_treatment.previous_detox IS
    'Whether the patient has undergone previous detoxification: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.detox_setting IS
    'Setting of previous detox: inpatient, outpatient, community, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.previous_rehab IS
    'Whether the patient has attended rehabilitation: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.rehab_type IS
    'Type of rehabilitation: residential, day-programme, outpatient, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.previous_counselling IS
    'Whether the patient has received counselling: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.counselling_type IS
    'Type of counselling: cbt, motivational-interviewing, group-therapy, 12-step, other, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.previous_medication_assisted IS
    'Whether the patient has received medication-assisted treatment: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.mat_medication IS
    'Medication used in medication-assisted treatment: methadone, buprenorphine, naltrexone, acamprosate, disulfiram, other, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.self_help_groups IS
    'Whether the patient has attended self-help groups: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.self_help_group_type IS
    'Type of self-help group: aa, na, smart-recovery, other, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.longest_period_abstinent IS
    'Longest period of abstinence: less-1-month, 1-3-months, 3-6-months, 6-12-months, greater-1-year, or empty.';
COMMENT ON COLUMN assessment_previous_treatment.relapse_triggers IS
    'Known relapse triggers.';
COMMENT ON COLUMN assessment_previous_treatment.treatment_history_notes IS
    'Additional clinician notes on previous treatment history.';
