-- 07-assessment-cardiovascular.sql
-- Step 5: cardiovascular examination and RCRI components.

CREATE TABLE assessment_cardiovascular (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    heart_rhythm VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (heart_rhythm IN ('sinus', 'atrial-fibrillation', 'flutter', 'heart-block', 'paced', 'other', '')),
    murmur_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (murmur_present IN ('yes', 'no', '')),
    murmur_description VARCHAR(255) NOT NULL DEFAULT '',
    peripheral_pulses VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (peripheral_pulses IN ('normal', 'reduced', 'absent', '')),
    jvp_raised VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (jvp_raised IN ('yes', 'no', '')),
    peripheral_oedema VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (peripheral_oedema IN ('none', 'mild', 'moderate', 'severe', '')),

    ecg_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ecg_performed IN ('yes', 'no', '')),
    ecg_rhythm VARCHAR(50) NOT NULL DEFAULT '',
    ecg_rate_bpm INTEGER,
    ecg_axis VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (ecg_axis IN ('normal', 'left', 'right', 'extreme', '')),
    ecg_ischaemic_changes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ecg_ischaemic_changes IN ('yes', 'no', '')),
    ecg_notes TEXT NOT NULL DEFAULT '',

    echo_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (echo_performed IN ('yes', 'no', '')),
    echo_ef_percent INTEGER
        CHECK (echo_ef_percent IS NULL OR echo_ef_percent BETWEEN 5 AND 80),
    echo_notes TEXT NOT NULL DEFAULT '',

    -- RCRI cardiac-history components
    history_ihd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_ihd IN ('yes', 'no', '')),
    history_chf VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_chf IN ('yes', 'no', '')),
    history_stroke_tia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_stroke_tia IN ('yes', 'no', '')),
    recent_mi_within_3_months VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_mi_within_3_months IN ('yes', 'no', '')),
    pacemaker_or_icd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pacemaker_or_icd IN ('yes', 'no', '')),
    severe_valve_dysfunction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (severe_valve_dysfunction IN ('yes', 'no', '')),
    active_angina VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (active_angina IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiovascular_updated_at
    BEFORE UPDATE ON assessment_cardiovascular
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular IS
    'Step 5: cardiovascular examination, ECG review, echocardiogram summary, and RCRI cardiac-history components.';
COMMENT ON COLUMN assessment_cardiovascular.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_cardiovascular.heart_rhythm IS
    'Rhythm on auscultation or ECG: sinus, atrial-fibrillation, flutter, heart-block, paced, other.';
COMMENT ON COLUMN assessment_cardiovascular.murmur_present IS
    'Whether a murmur is audible.';
COMMENT ON COLUMN assessment_cardiovascular.murmur_description IS
    'Free-text description of the murmur (timing, character, radiation).';
COMMENT ON COLUMN assessment_cardiovascular.peripheral_pulses IS
    'Peripheral pulses: normal, reduced, absent.';
COMMENT ON COLUMN assessment_cardiovascular.jvp_raised IS
    'Whether the JVP is raised.';
COMMENT ON COLUMN assessment_cardiovascular.peripheral_oedema IS
    'Peripheral oedema: none, mild, moderate, severe.';
COMMENT ON COLUMN assessment_cardiovascular.ecg_performed IS
    'Whether an ECG was performed or reviewed.';
COMMENT ON COLUMN assessment_cardiovascular.ecg_rhythm IS
    'ECG rhythm interpretation.';
COMMENT ON COLUMN assessment_cardiovascular.ecg_rate_bpm IS
    'ECG-measured ventricular rate in beats per minute.';
COMMENT ON COLUMN assessment_cardiovascular.ecg_axis IS
    'ECG cardiac axis: normal, left, right, extreme.';
COMMENT ON COLUMN assessment_cardiovascular.ecg_ischaemic_changes IS
    'Whether ischaemic changes are present on ECG.';
COMMENT ON COLUMN assessment_cardiovascular.ecg_notes IS
    'Clinician free-text notes on ECG.';
COMMENT ON COLUMN assessment_cardiovascular.echo_performed IS
    'Whether an echocardiogram was performed or reviewed.';
COMMENT ON COLUMN assessment_cardiovascular.echo_ef_percent IS
    'Left ventricular ejection fraction as a percentage.';
COMMENT ON COLUMN assessment_cardiovascular.echo_notes IS
    'Clinician free-text notes on echo findings.';
COMMENT ON COLUMN assessment_cardiovascular.history_ihd IS
    'RCRI component: history of ischaemic heart disease.';
COMMENT ON COLUMN assessment_cardiovascular.history_chf IS
    'RCRI component: history of congestive heart failure.';
COMMENT ON COLUMN assessment_cardiovascular.history_stroke_tia IS
    'RCRI component: history of cerebrovascular disease (stroke / TIA).';
COMMENT ON COLUMN assessment_cardiovascular.recent_mi_within_3_months IS
    'Recent myocardial infarction within the last 3 months.';
COMMENT ON COLUMN assessment_cardiovascular.pacemaker_or_icd IS
    'Implanted pacemaker or implantable cardioverter-defibrillator.';
COMMENT ON COLUMN assessment_cardiovascular.severe_valve_dysfunction IS
    'Severe valvular heart disease (e.g. severe AS, severe MR).';
COMMENT ON COLUMN assessment_cardiovascular.active_angina IS
    'Ongoing active angina / unstable chest pain.';
