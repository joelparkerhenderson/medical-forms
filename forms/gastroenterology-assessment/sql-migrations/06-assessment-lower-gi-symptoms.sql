-- 06_assessment_lower_gi_symptoms.sql
-- Step 4: Lower GI symptoms section of the gastroenterology assessment.

CREATE TABLE assessment_lower_gi_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    altered_bowel_habit VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (altered_bowel_habit IN ('yes', 'no', '')),
    bowel_habit_change_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bowel_habit_change_type IN ('diarrhoea', 'constipation', 'alternating', '')),
    stool_frequency_per_day INTEGER
        CHECK (stool_frequency_per_day IS NULL OR stool_frequency_per_day >= 0),
    bristol_stool_type INTEGER
        CHECK (bristol_stool_type IS NULL OR (bristol_stool_type >= 1 AND bristol_stool_type <= 7)),
    rectal_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rectal_bleeding IN ('yes', 'no', '')),
    bleeding_colour VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bleeding_colour IN ('bright_red', 'dark_red', 'mixed_with_stool', 'on_paper', '')),
    melaena VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (melaena IN ('yes', 'no', '')),
    mucus_in_stool VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mucus_in_stool IN ('yes', 'no', '')),
    tenesmus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tenesmus IN ('yes', 'no', '')),
    urgency VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urgency IN ('yes', 'no', '')),
    incontinence VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (incontinence IN ('yes', 'no', '')),
    flatulence VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (flatulence IN ('normal', 'excessive', '')),
    abdominal_distension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (abdominal_distension IN ('yes', 'no', '')),
    perianal_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (perianal_symptoms IN ('yes', 'no', '')),
    perianal_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lower_gi_symptoms_updated_at
    BEFORE UPDATE ON assessment_lower_gi_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lower_gi_symptoms IS
    'Step 4 Lower GI Symptoms: colonic and rectal symptom assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lower_gi_symptoms.altered_bowel_habit IS
    'Whether the patient has experienced a change in bowel habit (red flag if persistent).';
COMMENT ON COLUMN assessment_lower_gi_symptoms.bowel_habit_change_type IS
    'Type of bowel habit change.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.stool_frequency_per_day IS
    'Average number of stools per day.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.bristol_stool_type IS
    'Bristol Stool Chart type (1-7): 1-2 constipation, 3-4 normal, 5-7 diarrhoea.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.rectal_bleeding IS
    'Whether the patient has rectal bleeding (red flag symptom).';
COMMENT ON COLUMN assessment_lower_gi_symptoms.bleeding_colour IS
    'Colour and nature of rectal bleeding.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.melaena IS
    'Whether the patient has melaena (black tarry stools, indicating upper GI bleed).';
COMMENT ON COLUMN assessment_lower_gi_symptoms.mucus_in_stool IS
    'Whether mucus is present in the stool.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.tenesmus IS
    'Whether the patient experiences tenesmus (sensation of incomplete evacuation).';
COMMENT ON COLUMN assessment_lower_gi_symptoms.urgency IS
    'Whether the patient experiences faecal urgency.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.incontinence IS
    'Whether the patient has faecal incontinence.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.flatulence IS
    'Whether flatulence is excessive.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.abdominal_distension IS
    'Whether the patient has abdominal distension.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.perianal_symptoms IS
    'Whether the patient has perianal symptoms (e.g. pain, itching, discharge).';
COMMENT ON COLUMN assessment_lower_gi_symptoms.perianal_details IS
    'Details of perianal symptoms.';
COMMENT ON COLUMN assessment_lower_gi_symptoms.additional_notes IS
    'Additional notes about lower GI symptoms.';
