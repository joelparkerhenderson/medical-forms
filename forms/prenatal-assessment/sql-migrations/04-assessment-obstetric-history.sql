-- 04_assessment_obstetric_history.sql
-- Obstetric history section of the prenatal assessment.

CREATE TABLE assessment_obstetric_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gravida INTEGER
        CHECK (gravida IS NULL OR gravida >= 0),
    para INTEGER
        CHECK (para IS NULL OR para >= 0),
    living_children INTEGER
        CHECK (living_children IS NULL OR living_children >= 0),
    miscarriages INTEGER
        CHECK (miscarriages IS NULL OR miscarriages >= 0),
    terminations INTEGER
        CHECK (terminations IS NULL OR terminations >= 0),
    ectopic_pregnancies INTEGER
        CHECK (ectopic_pregnancies IS NULL OR ectopic_pregnancies >= 0),
    stillbirths INTEGER
        CHECK (stillbirths IS NULL OR stillbirths >= 0),
    neonatal_deaths INTEGER
        CHECK (neonatal_deaths IS NULL OR neonatal_deaths >= 0),
    previous_caesarean VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_caesarean IN ('yes', 'no', '')),
    caesarean_count INTEGER
        CHECK (caesarean_count IS NULL OR caesarean_count >= 0),
    previous_preterm_birth VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_preterm_birth IN ('yes', 'no', '')),
    previous_preeclampsia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_preeclampsia IN ('yes', 'no', '')),
    previous_gestational_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_gestational_diabetes IN ('yes', 'no', '')),
    previous_postpartum_haemorrhage VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_postpartum_haemorrhage IN ('yes', 'no', '')),
    previous_complications_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_obstetric_history_updated_at
    BEFORE UPDATE ON assessment_obstetric_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_obstetric_history IS
    'Obstetric history section: gravidity, parity, pregnancy losses, prior complications. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_obstetric_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_obstetric_history.gravida IS
    'Total number of pregnancies including current (gravidity).';
COMMENT ON COLUMN assessment_obstetric_history.para IS
    'Number of pregnancies carried to viable gestational age (parity).';
COMMENT ON COLUMN assessment_obstetric_history.living_children IS
    'Number of living children.';
COMMENT ON COLUMN assessment_obstetric_history.miscarriages IS
    'Number of spontaneous miscarriages.';
COMMENT ON COLUMN assessment_obstetric_history.terminations IS
    'Number of elective terminations.';
COMMENT ON COLUMN assessment_obstetric_history.ectopic_pregnancies IS
    'Number of ectopic pregnancies.';
COMMENT ON COLUMN assessment_obstetric_history.stillbirths IS
    'Number of stillbirths.';
COMMENT ON COLUMN assessment_obstetric_history.neonatal_deaths IS
    'Number of neonatal deaths.';
COMMENT ON COLUMN assessment_obstetric_history.previous_caesarean IS
    'Whether the patient has had a previous caesarean section.';
COMMENT ON COLUMN assessment_obstetric_history.caesarean_count IS
    'Number of previous caesarean sections.';
COMMENT ON COLUMN assessment_obstetric_history.previous_preterm_birth IS
    'Whether the patient has had a previous preterm birth (before 37 weeks).';
COMMENT ON COLUMN assessment_obstetric_history.previous_preeclampsia IS
    'Whether the patient has had previous preeclampsia or eclampsia.';
COMMENT ON COLUMN assessment_obstetric_history.previous_gestational_diabetes IS
    'Whether the patient has had previous gestational diabetes mellitus.';
COMMENT ON COLUMN assessment_obstetric_history.previous_postpartum_haemorrhage IS
    'Whether the patient has had a previous postpartum haemorrhage.';
