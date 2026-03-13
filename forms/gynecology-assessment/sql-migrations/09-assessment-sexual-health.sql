-- 09_assessment_sexual_health.sql
-- Sexual health section of the gynaecology assessment.

CREATE TABLE assessment_sexual_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    sexually_active VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sexually_active IN ('yes', 'no', '')),
    contraception_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (contraception_use IN ('yes', 'no', '')),
    contraception_method VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (contraception_method IN ('combined-pill', 'progesterone-only-pill', 'implant', 'injection', 'iud', 'ius', 'condom', 'natural', 'sterilisation', 'other', '')),
    contraception_details TEXT NOT NULL DEFAULT '',
    sti_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sti_history IN ('yes', 'no', '')),
    sti_details TEXT NOT NULL DEFAULT '',
    last_sti_screen_date DATE,
    sti_screen_result VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sti_screen_result IN ('negative', 'positive', 'unknown', '')),
    fertility_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fertility_concerns IN ('yes', 'no', '')),
    fertility_concern_details TEXT NOT NULL DEFAULT '',
    sexual_dysfunction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sexual_dysfunction IN ('yes', 'no', '')),
    sexual_dysfunction_details TEXT NOT NULL DEFAULT '',
    domestic_abuse_screen VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (domestic_abuse_screen IN ('positive', 'negative', 'declined', '')),
    sexual_health_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sexual_health_updated_at
    BEFORE UPDATE ON assessment_sexual_health
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sexual_health IS
    'Sexual health section: contraception, STI history, fertility concerns, and domestic abuse screen. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sexual_health.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sexual_health.sexually_active IS
    'Whether the patient is sexually active: yes, no, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.contraception_use IS
    'Whether contraception is being used: yes, no, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.contraception_method IS
    'Contraception method: combined-pill, progesterone-only-pill, implant, injection, iud, ius, condom, natural, sterilisation, other, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.contraception_details IS
    'Additional contraception details.';
COMMENT ON COLUMN assessment_sexual_health.sti_history IS
    'Whether there is a history of sexually transmitted infections: yes, no, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.sti_details IS
    'Details of STI history.';
COMMENT ON COLUMN assessment_sexual_health.last_sti_screen_date IS
    'Date of last STI screen, NULL if never screened or unanswered.';
COMMENT ON COLUMN assessment_sexual_health.sti_screen_result IS
    'Result of last STI screen: negative, positive, unknown, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.fertility_concerns IS
    'Whether there are fertility concerns: yes, no, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.fertility_concern_details IS
    'Details of fertility concerns.';
COMMENT ON COLUMN assessment_sexual_health.sexual_dysfunction IS
    'Whether sexual dysfunction is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.sexual_dysfunction_details IS
    'Details of sexual dysfunction.';
COMMENT ON COLUMN assessment_sexual_health.domestic_abuse_screen IS
    'Domestic abuse screening result: positive, negative, declined, or empty string.';
COMMENT ON COLUMN assessment_sexual_health.sexual_health_notes IS
    'Free-text notes on sexual health.';
