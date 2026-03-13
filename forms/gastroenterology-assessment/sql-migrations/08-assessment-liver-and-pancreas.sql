-- 08_assessment_liver_and_pancreas.sql
-- Step 6: Liver and pancreas section of the gastroenterology assessment.

CREATE TABLE assessment_liver_and_pancreas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    jaundice VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (jaundice IN ('yes', 'no', '')),
    jaundice_duration VARCHAR(30) NOT NULL DEFAULT '',
    dark_urine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dark_urine IN ('yes', 'no', '')),
    pale_stools VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pale_stools IN ('yes', 'no', '')),
    pruritus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pruritus IN ('yes', 'no', '')),
    hepatomegaly VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatomegaly IN ('yes', 'no', '')),
    ascites VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ascites IN ('yes', 'no', '')),
    history_of_hepatitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_hepatitis IN ('yes', 'no', '')),
    hepatitis_type VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hepatitis_type IN ('a', 'b', 'c', '')),
    history_of_liver_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_liver_disease IN ('yes', 'no', '')),
    liver_disease_details TEXT NOT NULL DEFAULT '',
    alcohol_consumption VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_consumption IN ('none', 'light', 'moderate', 'heavy', '')),
    alcohol_units_per_week INTEGER
        CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    history_of_pancreatitis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_pancreatitis IN ('yes', 'no', '')),
    pancreatitis_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (pancreatitis_type IN ('acute', 'chronic', '')),
    history_of_gallstones VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_gallstones IN ('yes', 'no', '')),
    cholecystectomy_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cholecystectomy_performed IN ('yes', 'no', '')),
    liver_function_tests_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (liver_function_tests_available IN ('yes', 'no', '')),
    lft_notes TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_liver_and_pancreas_updated_at
    BEFORE UPDATE ON assessment_liver_and_pancreas
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_liver_and_pancreas IS
    'Step 6 Liver & Pancreas: hepatobiliary and pancreatic symptom assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_liver_and_pancreas.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_liver_and_pancreas.jaundice IS
    'Whether the patient has jaundice (red flag symptom).';
COMMENT ON COLUMN assessment_liver_and_pancreas.jaundice_duration IS
    'Duration of jaundice.';
COMMENT ON COLUMN assessment_liver_and_pancreas.dark_urine IS
    'Whether the patient has dark urine (conjugated hyperbilirubinaemia).';
COMMENT ON COLUMN assessment_liver_and_pancreas.pale_stools IS
    'Whether the patient has pale stools (obstructive jaundice).';
COMMENT ON COLUMN assessment_liver_and_pancreas.pruritus IS
    'Whether the patient has pruritus (cholestatic symptom).';
COMMENT ON COLUMN assessment_liver_and_pancreas.hepatomegaly IS
    'Whether hepatomegaly was detected on examination.';
COMMENT ON COLUMN assessment_liver_and_pancreas.ascites IS
    'Whether ascites is present (sign of decompensated liver disease).';
COMMENT ON COLUMN assessment_liver_and_pancreas.history_of_hepatitis IS
    'Whether the patient has a history of viral hepatitis.';
COMMENT ON COLUMN assessment_liver_and_pancreas.hepatitis_type IS
    'Type of hepatitis: a, b, or c.';
COMMENT ON COLUMN assessment_liver_and_pancreas.history_of_liver_disease IS
    'Whether the patient has a history of chronic liver disease.';
COMMENT ON COLUMN assessment_liver_and_pancreas.liver_disease_details IS
    'Details of chronic liver disease.';
COMMENT ON COLUMN assessment_liver_and_pancreas.alcohol_consumption IS
    'Current alcohol consumption level (relevant to liver disease).';
COMMENT ON COLUMN assessment_liver_and_pancreas.alcohol_units_per_week IS
    'Alcohol consumption in units per week.';
COMMENT ON COLUMN assessment_liver_and_pancreas.history_of_pancreatitis IS
    'Whether the patient has a history of pancreatitis.';
COMMENT ON COLUMN assessment_liver_and_pancreas.pancreatitis_type IS
    'Type of pancreatitis: acute or chronic.';
COMMENT ON COLUMN assessment_liver_and_pancreas.history_of_gallstones IS
    'Whether the patient has a history of gallstones.';
COMMENT ON COLUMN assessment_liver_and_pancreas.cholecystectomy_performed IS
    'Whether the patient has had cholecystectomy.';
COMMENT ON COLUMN assessment_liver_and_pancreas.liver_function_tests_available IS
    'Whether recent liver function test results are available.';
COMMENT ON COLUMN assessment_liver_and_pancreas.lft_notes IS
    'Notes on liver function test results.';
COMMENT ON COLUMN assessment_liver_and_pancreas.additional_notes IS
    'Additional notes about hepatobiliary and pancreatic assessment.';
