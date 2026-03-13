-- 05_assessment_upper_gi_symptoms.sql
-- Step 3: Upper GI symptoms section of the gastroenterology assessment.

CREATE TABLE assessment_upper_gi_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    dysphagia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dysphagia IN ('yes', 'no', '')),
    dysphagia_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dysphagia_type IN ('solids', 'liquids', 'both', '')),
    dysphagia_progression VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dysphagia_progression IN ('stable', 'progressive', '')),
    odynophagia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (odynophagia IN ('yes', 'no', '')),
    heartburn VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (heartburn IN ('yes', 'no', '')),
    heartburn_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (heartburn_frequency IN ('daily', 'weekly', 'monthly', 'occasionally', '')),
    acid_regurgitation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (acid_regurgitation IN ('yes', 'no', '')),
    nausea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nausea IN ('yes', 'no', '')),
    nausea_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (nausea_frequency IN ('daily', 'weekly', 'occasionally', '')),
    vomiting VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vomiting IN ('yes', 'no', '')),
    vomiting_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vomiting_frequency IN ('daily', 'weekly', 'occasionally', '')),
    haematemesis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (haematemesis IN ('yes', 'no', '')),
    early_satiety VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (early_satiety IN ('yes', 'no', '')),
    bloating VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bloating IN ('yes', 'no', '')),
    epigastric_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (epigastric_pain IN ('yes', 'no', '')),
    epigastric_pain_relation_to_meals VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (epigastric_pain_relation_to_meals IN ('worse_with_food', 'better_with_food', 'no_relation', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_upper_gi_symptoms_updated_at
    BEFORE UPDATE ON assessment_upper_gi_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_upper_gi_symptoms IS
    'Step 3 Upper GI Symptoms: oesophageal and gastric symptom assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_upper_gi_symptoms.dysphagia IS
    'Whether the patient experiences difficulty swallowing (red flag symptom).';
COMMENT ON COLUMN assessment_upper_gi_symptoms.dysphagia_type IS
    'Whether dysphagia is for solids, liquids, or both.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.dysphagia_progression IS
    'Whether dysphagia is stable or progressive (progressive is a red flag).';
COMMENT ON COLUMN assessment_upper_gi_symptoms.odynophagia IS
    'Whether the patient experiences painful swallowing.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.heartburn IS
    'Whether the patient experiences heartburn (retrosternal burning).';
COMMENT ON COLUMN assessment_upper_gi_symptoms.heartburn_frequency IS
    'Frequency of heartburn episodes.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.acid_regurgitation IS
    'Whether the patient experiences acid regurgitation.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.nausea IS
    'Whether the patient experiences nausea.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.nausea_frequency IS
    'Frequency of nausea.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.vomiting IS
    'Whether the patient experiences vomiting.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.vomiting_frequency IS
    'Frequency of vomiting episodes.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.haematemesis IS
    'Whether the patient has vomited blood (red flag symptom).';
COMMENT ON COLUMN assessment_upper_gi_symptoms.early_satiety IS
    'Whether the patient experiences early satiety.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.bloating IS
    'Whether the patient experiences upper abdominal bloating.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.epigastric_pain IS
    'Whether the patient has epigastric pain.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.epigastric_pain_relation_to_meals IS
    'Relationship of epigastric pain to meals.';
COMMENT ON COLUMN assessment_upper_gi_symptoms.additional_notes IS
    'Additional notes about upper GI symptoms.';
