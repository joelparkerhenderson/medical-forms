CREATE TABLE casualty_card_primary_survey (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id          UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- A: Airway
    airway_status             TEXT NOT NULL DEFAULT ''
                              CHECK (airway_status IN ('patent', 'compromised', 'obstructed', '')),
    airway_adjuncts           TEXT NOT NULL DEFAULT '',
    c_spine_immobilised       TEXT NOT NULL DEFAULT ''
                              CHECK (c_spine_immobilised IN ('yes', 'no', '')),
    -- B: Breathing
    breathing_effort          TEXT NOT NULL DEFAULT ''
                              CHECK (breathing_effort IN ('normal', 'laboured', 'shallow', 'absent', '')),
    chest_movement            TEXT NOT NULL DEFAULT '',
    breath_sounds             TEXT NOT NULL DEFAULT '',
    trachea_position          TEXT NOT NULL DEFAULT '',
    -- C: Circulation
    pulse_character           TEXT NOT NULL DEFAULT '',
    skin_colour               TEXT NOT NULL DEFAULT '',
    skin_temperature          TEXT NOT NULL DEFAULT '',
    capillary_refill          TEXT NOT NULL DEFAULT '',
    haemorrhage               TEXT NOT NULL DEFAULT '',
    iv_access                 TEXT NOT NULL DEFAULT '',
    -- D: Disability (GCS and neurological)
    gcs_eye                   INTEGER
                              CHECK (gcs_eye IS NULL OR (gcs_eye >= 1 AND gcs_eye <= 4)),
    gcs_verbal                INTEGER
                              CHECK (gcs_verbal IS NULL OR (gcs_verbal >= 1 AND gcs_verbal <= 5)),
    gcs_motor                 INTEGER
                              CHECK (gcs_motor IS NULL OR (gcs_motor >= 1 AND gcs_motor <= 6)),
    gcs_total                 INTEGER
                              CHECK (gcs_total IS NULL OR (gcs_total >= 3 AND gcs_total <= 15)),
    pupils                    TEXT NOT NULL DEFAULT '',
    blood_glucose_disability  TEXT NOT NULL DEFAULT '',
    limb_movements            TEXT NOT NULL DEFAULT '',
    -- E: Exposure
    skin_examination          TEXT NOT NULL DEFAULT '',
    injuries_identified       TEXT NOT NULL DEFAULT '',
    log_roll_findings         TEXT NOT NULL DEFAULT ''
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_primary_survey_updated_at
    BEFORE UPDATE ON casualty_card_primary_survey
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_primary_survey IS
    '1:1 with casualty_card. ABCDE primary survey assessment with GCS scoring.';
COMMENT ON COLUMN casualty_card_primary_survey.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_primary_survey.airway_status IS
    'Airway status: patent, compromised, obstructed, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_primary_survey.airway_adjuncts IS
    'Airway adjuncts in use (e.g. oropharyngeal, nasopharyngeal, LMA, ETT).';
COMMENT ON COLUMN casualty_card_primary_survey.c_spine_immobilised IS
    'Whether cervical spine immobilisation is in place: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_primary_survey.breathing_effort IS
    'Breathing effort: normal, laboured, shallow, absent, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_primary_survey.chest_movement IS
    'Description of chest wall movement (e.g. equal bilateral, asymmetric).';
COMMENT ON COLUMN casualty_card_primary_survey.breath_sounds IS
    'Auscultation findings (e.g. clear bilateral, wheeze, crackles, absent).';
COMMENT ON COLUMN casualty_card_primary_survey.trachea_position IS
    'Trachea position (e.g. central, deviated left, deviated right).';
COMMENT ON COLUMN casualty_card_primary_survey.pulse_character IS
    'Pulse character (e.g. regular, irregular, bounding, thready, absent).';
COMMENT ON COLUMN casualty_card_primary_survey.skin_colour IS
    'Skin colour (e.g. normal, pale, cyanosed, flushed, mottled).';
COMMENT ON COLUMN casualty_card_primary_survey.skin_temperature IS
    'Skin temperature on palpation (e.g. warm, cool, cold, clammy).';
COMMENT ON COLUMN casualty_card_primary_survey.capillary_refill IS
    'Capillary refill time assessment.';
COMMENT ON COLUMN casualty_card_primary_survey.haemorrhage IS
    'Description of any active haemorrhage and control measures.';
COMMENT ON COLUMN casualty_card_primary_survey.iv_access IS
    'IV access details (e.g. 18G left ACF, none).';
COMMENT ON COLUMN casualty_card_primary_survey.gcs_eye IS
    'Glasgow Coma Scale eye opening component (1-4). NULL if not assessed.';
COMMENT ON COLUMN casualty_card_primary_survey.gcs_verbal IS
    'Glasgow Coma Scale verbal response component (1-5). NULL if not assessed.';
COMMENT ON COLUMN casualty_card_primary_survey.gcs_motor IS
    'Glasgow Coma Scale motor response component (1-6). NULL if not assessed.';
COMMENT ON COLUMN casualty_card_primary_survey.gcs_total IS
    'Glasgow Coma Scale total (3-15), auto-calculated from eye + verbal + motor. NULL if components not complete.';
COMMENT ON COLUMN casualty_card_primary_survey.pupils IS
    'Pupil assessment findings.';
COMMENT ON COLUMN casualty_card_primary_survey.blood_glucose_disability IS
    'Blood glucose level recorded during disability assessment.';
COMMENT ON COLUMN casualty_card_primary_survey.limb_movements IS
    'Limb movement assessment (e.g. all limbs moving spontaneously).';
COMMENT ON COLUMN casualty_card_primary_survey.skin_examination IS
    'Skin examination findings on exposure (e.g. rashes, wounds, bruising).';
COMMENT ON COLUMN casualty_card_primary_survey.injuries_identified IS
    'Injuries identified on full exposure examination.';
COMMENT ON COLUMN casualty_card_primary_survey.log_roll_findings IS
    'Findings from log roll examination (e.g. spinal tenderness, sacral oedema).';
COMMENT ON COLUMN casualty_card_primary_survey.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_primary_survey.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_primary_survey.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_primary_survey.deleted_at IS
    'Timestamp when this row was deleted.';
