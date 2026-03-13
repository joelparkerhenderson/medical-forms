-- 07_assessment_urinary_symptoms.sql
-- Urinary symptoms section of the urology assessment.

CREATE TABLE assessment_urinary_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Storage symptoms
    urinary_frequency_daytime INTEGER
        CHECK (urinary_frequency_daytime IS NULL OR urinary_frequency_daytime >= 0),
    urgency VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urgency IN ('yes', 'no', '')),
    urge_incontinence VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urge_incontinence IN ('yes', 'no', '')),
    stress_incontinence VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stress_incontinence IN ('yes', 'no', '')),
    pad_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pad_use IN ('yes', 'no', '')),
    pads_per_day INTEGER
        CHECK (pads_per_day IS NULL OR pads_per_day >= 0),

    -- Voiding symptoms
    hesitancy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hesitancy IN ('yes', 'no', '')),
    poor_stream VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (poor_stream IN ('yes', 'no', '')),
    terminal_dribbling VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (terminal_dribbling IN ('yes', 'no', '')),
    post_void_dribbling VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (post_void_dribbling IN ('yes', 'no', '')),
    feeling_of_incomplete_emptying VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (feeling_of_incomplete_emptying IN ('yes', 'no', '')),
    urinary_retention_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urinary_retention_history IN ('yes', 'no', '')),

    -- Haematuria and pain
    haematuria VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (haematuria IN ('yes', 'no', '')),
    haematuria_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (haematuria_type IN ('gross', 'microscopic', '')),
    dysuria VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dysuria IN ('yes', 'no', '')),
    suprapubic_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suprapubic_pain IN ('yes', 'no', '')),
    loin_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (loin_pain IN ('yes', 'no', '')),
    recurrent_utis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recurrent_utis IN ('yes', 'no', '')),
    uti_frequency_per_year INTEGER
        CHECK (uti_frequency_per_year IS NULL OR uti_frequency_per_year >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_urinary_symptoms_updated_at
    BEFORE UPDATE ON assessment_urinary_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_urinary_symptoms IS
    'Urinary symptoms section: storage, voiding, haematuria, and pain symptoms. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_urinary_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_urinary_symptoms.urinary_frequency_daytime IS
    'Number of daytime voids.';
COMMENT ON COLUMN assessment_urinary_symptoms.urgency IS
    'Whether patient experiences urinary urgency.';
COMMENT ON COLUMN assessment_urinary_symptoms.urge_incontinence IS
    'Whether patient has urge incontinence.';
COMMENT ON COLUMN assessment_urinary_symptoms.stress_incontinence IS
    'Whether patient has stress incontinence.';
COMMENT ON COLUMN assessment_urinary_symptoms.pad_use IS
    'Whether patient uses incontinence pads.';
COMMENT ON COLUMN assessment_urinary_symptoms.pads_per_day IS
    'Number of incontinence pads used per day.';
COMMENT ON COLUMN assessment_urinary_symptoms.hesitancy IS
    'Whether patient experiences urinary hesitancy.';
COMMENT ON COLUMN assessment_urinary_symptoms.poor_stream IS
    'Whether patient has a poor urinary stream.';
COMMENT ON COLUMN assessment_urinary_symptoms.terminal_dribbling IS
    'Whether patient has terminal dribbling.';
COMMENT ON COLUMN assessment_urinary_symptoms.post_void_dribbling IS
    'Whether patient has post-void dribbling.';
COMMENT ON COLUMN assessment_urinary_symptoms.feeling_of_incomplete_emptying IS
    'Whether patient has a feeling of incomplete bladder emptying.';
COMMENT ON COLUMN assessment_urinary_symptoms.urinary_retention_history IS
    'Whether patient has a history of urinary retention.';
COMMENT ON COLUMN assessment_urinary_symptoms.haematuria IS
    'Whether patient has haematuria (blood in urine).';
COMMENT ON COLUMN assessment_urinary_symptoms.haematuria_type IS
    'Type of haematuria: gross (visible) or microscopic.';
COMMENT ON COLUMN assessment_urinary_symptoms.dysuria IS
    'Whether patient has dysuria (painful urination).';
COMMENT ON COLUMN assessment_urinary_symptoms.suprapubic_pain IS
    'Whether patient has suprapubic pain.';
COMMENT ON COLUMN assessment_urinary_symptoms.loin_pain IS
    'Whether patient has loin pain (possible renal origin).';
COMMENT ON COLUMN assessment_urinary_symptoms.recurrent_utis IS
    'Whether patient has recurrent urinary tract infections.';
COMMENT ON COLUMN assessment_urinary_symptoms.uti_frequency_per_year IS
    'Number of UTIs per year if recurrent.';
