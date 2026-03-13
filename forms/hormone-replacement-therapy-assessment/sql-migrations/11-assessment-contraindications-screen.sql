-- 11_assessment_contraindications_screen.sql
-- Contraindications screening section of the HRT assessment.

CREATE TABLE assessment_contraindications_screen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Absolute contraindications
    undiagnosed_vaginal_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (undiagnosed_vaginal_bleeding IN ('yes', 'no', '')),
    known_or_suspected_breast_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_or_suspected_breast_cancer IN ('yes', 'no', '')),
    known_or_suspected_oestrogen_dependent_neoplasm VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_or_suspected_oestrogen_dependent_neoplasm IN ('yes', 'no', '')),
    active_or_recent_vte VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (active_or_recent_vte IN ('yes', 'no', '')),
    active_or_recent_arterial_thromboembolism VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (active_or_recent_arterial_thromboembolism IN ('yes', 'no', '')),
    untreated_endometrial_hyperplasia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (untreated_endometrial_hyperplasia IN ('yes', 'no', '')),
    active_liver_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (active_liver_disease IN ('yes', 'no', '')),
    porphyria VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (porphyria IN ('yes', 'no', '')),
    known_pregnancy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_pregnancy IN ('yes', 'no', '')),

    -- Relative contraindications / cautions
    history_of_endometrial_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_endometrial_cancer IN ('yes', 'no', '')),
    history_of_vte VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_vte IN ('yes', 'no', '')),
    thrombophilia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (thrombophilia IN ('yes', 'no', 'unknown', '')),
    migraine_with_aura VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (migraine_with_aura IN ('yes', 'no', '')),
    gallbladder_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gallbladder_disease IN ('yes', 'no', '')),
    epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (epilepsy IN ('yes', 'no', '')),
    sle VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sle IN ('yes', 'no', '')),
    meningioma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (meningioma IN ('yes', 'no', '')),

    absolute_contraindication_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (absolute_contraindication_present IN ('yes', 'no', '')),
    relative_contraindication_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (relative_contraindication_present IN ('yes', 'no', '')),
    contraindication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_contraindications_screen_updated_at
    BEFORE UPDATE ON assessment_contraindications_screen
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_contraindications_screen IS
    'Contraindications screening section: absolute and relative contraindications to HRT. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_contraindications_screen.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_contraindications_screen.undiagnosed_vaginal_bleeding IS
    'Absolute: undiagnosed vaginal bleeding present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.known_or_suspected_breast_cancer IS
    'Absolute: known or suspected breast cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.known_or_suspected_oestrogen_dependent_neoplasm IS
    'Absolute: known or suspected oestrogen-dependent neoplasm: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.active_or_recent_vte IS
    'Absolute: active or recent venous thromboembolism: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.active_or_recent_arterial_thromboembolism IS
    'Absolute: active or recent arterial thromboembolism (stroke, MI): yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.untreated_endometrial_hyperplasia IS
    'Absolute: untreated endometrial hyperplasia: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.active_liver_disease IS
    'Absolute: active liver disease with abnormal LFTs: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.porphyria IS
    'Absolute: porphyria: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.known_pregnancy IS
    'Absolute: known or suspected pregnancy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.history_of_endometrial_cancer IS
    'Relative: history of endometrial cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.history_of_vte IS
    'Relative: history of VTE: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.thrombophilia IS
    'Relative: known thrombophilia (e.g. Factor V Leiden): yes, no, unknown, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.migraine_with_aura IS
    'Relative: migraine with aura: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.gallbladder_disease IS
    'Relative: gallbladder disease: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.epilepsy IS
    'Relative: epilepsy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.sle IS
    'Relative: systemic lupus erythematosus: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.meningioma IS
    'Relative: meningioma (contraindication for progestogens): yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.absolute_contraindication_present IS
    'Summary: whether any absolute contraindication is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.relative_contraindication_present IS
    'Summary: whether any relative contraindication is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_contraindications_screen.contraindication_notes IS
    'Free-text notes on contraindications screening.';
