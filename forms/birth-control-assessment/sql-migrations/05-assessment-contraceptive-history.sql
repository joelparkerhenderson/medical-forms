-- 05_assessment_contraceptive_history.sql
-- Contraceptive history section of the birth control assessment.

CREATE TABLE assessment_contraceptive_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_contraception VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_contraception IN ('yes', 'no', '')),
    previous_coc VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_coc IN ('yes', 'no', '')),
    coc_details TEXT NOT NULL DEFAULT '',
    previous_pop VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_pop IN ('yes', 'no', '')),
    pop_details TEXT NOT NULL DEFAULT '',
    previous_implant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_implant IN ('yes', 'no', '')),
    implant_details TEXT NOT NULL DEFAULT '',
    previous_injection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_injection IN ('yes', 'no', '')),
    injection_details TEXT NOT NULL DEFAULT '',
    previous_iud VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_iud IN ('yes', 'no', '')),
    iud_details TEXT NOT NULL DEFAULT '',
    previous_ius VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_ius IN ('yes', 'no', '')),
    ius_details TEXT NOT NULL DEFAULT '',
    previous_patch_ring VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_patch_ring IN ('yes', 'no', '')),
    patch_ring_details TEXT NOT NULL DEFAULT '',
    previous_barrier VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_barrier IN ('yes', 'no', '')),
    reason_for_change TEXT NOT NULL DEFAULT '',
    adverse_effects TEXT NOT NULL DEFAULT '',
    contraceptive_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_contraceptive_history_updated_at
    BEFORE UPDATE ON assessment_contraceptive_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_contraceptive_history IS
    'Contraceptive history section: previous methods used, reasons for change, and adverse effects. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_contraceptive_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_contraceptive_history.previous_contraception IS
    'Whether the patient has used contraception previously: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.previous_coc IS
    'Whether the patient has used combined oral contraception: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.coc_details IS
    'Details of combined oral contraception use.';
COMMENT ON COLUMN assessment_contraceptive_history.previous_pop IS
    'Whether the patient has used progestogen-only pill: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.pop_details IS
    'Details of progestogen-only pill use.';
COMMENT ON COLUMN assessment_contraceptive_history.previous_implant IS
    'Whether the patient has used a contraceptive implant: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.implant_details IS
    'Details of contraceptive implant use.';
COMMENT ON COLUMN assessment_contraceptive_history.previous_injection IS
    'Whether the patient has used injectable contraception: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.injection_details IS
    'Details of injectable contraception use.';
COMMENT ON COLUMN assessment_contraceptive_history.previous_iud IS
    'Whether the patient has used a copper IUD: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.iud_details IS
    'Details of copper IUD use.';
COMMENT ON COLUMN assessment_contraceptive_history.previous_ius IS
    'Whether the patient has used a hormonal IUS (e.g. Mirena): yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.ius_details IS
    'Details of hormonal IUS use.';
COMMENT ON COLUMN assessment_contraceptive_history.previous_patch_ring IS
    'Whether the patient has used contraceptive patch or ring: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.patch_ring_details IS
    'Details of contraceptive patch or ring use.';
COMMENT ON COLUMN assessment_contraceptive_history.previous_barrier IS
    'Whether the patient has used barrier methods (condom, diaphragm): yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_history.reason_for_change IS
    'Reason for seeking new contraception or changing method.';
COMMENT ON COLUMN assessment_contraceptive_history.adverse_effects IS
    'Previous adverse effects from contraception.';
COMMENT ON COLUMN assessment_contraceptive_history.contraceptive_history_notes IS
    'Additional clinician notes on contraceptive history.';
