-- 12_assessment_red_flags_and_social.sql
-- Step 10: Red flags and social history section of the gastroenterology assessment.

CREATE TABLE assessment_red_flags_and_social (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Red flag symptoms
    unintentional_weight_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (unintentional_weight_loss IN ('yes', 'no', '')),
    progressive_dysphagia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (progressive_dysphagia IN ('yes', 'no', '')),
    gi_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gi_bleeding IN ('yes', 'no', '')),
    iron_deficiency_anaemia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (iron_deficiency_anaemia IN ('yes', 'no', '')),
    persistent_vomiting VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (persistent_vomiting IN ('yes', 'no', '')),
    palpable_abdominal_mass VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (palpable_abdominal_mass IN ('yes', 'no', '')),
    new_onset_symptoms_over_50 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (new_onset_symptoms_over_50 IN ('yes', 'no', '')),
    family_history_gi_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_gi_cancer IN ('yes', 'no', '')),
    family_gi_cancer_details TEXT NOT NULL DEFAULT '',
    night_sweats VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (night_sweats IN ('yes', 'no', '')),
    fever VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fever IN ('yes', 'no', '')),

    -- Social history
    tobacco_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tobacco_use IN ('current', 'former', 'never', '')),
    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'light', 'moderate', 'heavy', '')),
    recreational_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_drug_use IN ('yes', 'no', '')),
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    travel_history TEXT NOT NULL DEFAULT '',
    stress_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (stress_level IN ('low', 'moderate', 'high', '')),
    psychological_impact TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_red_flags_and_social_updated_at
    BEFORE UPDATE ON assessment_red_flags_and_social
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_red_flags_and_social IS
    'Step 10 Red Flags & Social: GI red flag symptoms requiring urgent investigation and social history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_red_flags_and_social.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_red_flags_and_social.unintentional_weight_loss IS
    'Whether the patient has unintentional weight loss (red flag for GI malignancy).';
COMMENT ON COLUMN assessment_red_flags_and_social.progressive_dysphagia IS
    'Whether the patient has progressive dysphagia (red flag for oesophageal malignancy).';
COMMENT ON COLUMN assessment_red_flags_and_social.gi_bleeding IS
    'Whether the patient has GI bleeding (haematemesis, melaena, or rectal bleeding).';
COMMENT ON COLUMN assessment_red_flags_and_social.iron_deficiency_anaemia IS
    'Whether the patient has iron deficiency anaemia (red flag for GI malignancy).';
COMMENT ON COLUMN assessment_red_flags_and_social.persistent_vomiting IS
    'Whether the patient has persistent vomiting.';
COMMENT ON COLUMN assessment_red_flags_and_social.palpable_abdominal_mass IS
    'Whether a palpable abdominal mass has been detected (red flag).';
COMMENT ON COLUMN assessment_red_flags_and_social.new_onset_symptoms_over_50 IS
    'Whether GI symptoms are new-onset in a patient over 50 (increased malignancy risk).';
COMMENT ON COLUMN assessment_red_flags_and_social.family_history_gi_cancer IS
    'Whether there is a family history of GI cancer.';
COMMENT ON COLUMN assessment_red_flags_and_social.family_gi_cancer_details IS
    'Details of family GI cancer history.';
COMMENT ON COLUMN assessment_red_flags_and_social.night_sweats IS
    'Whether the patient has night sweats (B symptom).';
COMMENT ON COLUMN assessment_red_flags_and_social.fever IS
    'Whether the patient has fever (infection or inflammation indicator).';
COMMENT ON COLUMN assessment_red_flags_and_social.tobacco_use IS
    'Tobacco use status (risk factor for GI cancers).';
COMMENT ON COLUMN assessment_red_flags_and_social.alcohol_use IS
    'Alcohol consumption level (risk factor for liver and GI diseases).';
COMMENT ON COLUMN assessment_red_flags_and_social.recreational_drug_use IS
    'Whether the patient uses recreational drugs.';
COMMENT ON COLUMN assessment_red_flags_and_social.occupation IS
    'Patient occupation.';
COMMENT ON COLUMN assessment_red_flags_and_social.travel_history IS
    'Recent travel history (relevant to infectious GI conditions).';
COMMENT ON COLUMN assessment_red_flags_and_social.stress_level IS
    'Self-reported stress level (affects functional GI disorders).';
COMMENT ON COLUMN assessment_red_flags_and_social.psychological_impact IS
    'Psychological impact of GI symptoms.';
COMMENT ON COLUMN assessment_red_flags_and_social.additional_notes IS
    'Additional notes about red flags and social history.';
