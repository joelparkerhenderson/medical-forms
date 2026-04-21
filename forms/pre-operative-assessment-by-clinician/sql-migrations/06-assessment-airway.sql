-- 06-assessment-airway.sql
-- Step 4: airway examination and OSA screening.

CREATE TABLE assessment_airway (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mallampati_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mallampati_class IN ('I', 'II', 'III', 'IV', '')),
    thyromental_distance_cm NUMERIC(3,1),
    mouth_opening_cm NUMERIC(3,1),
    inter_incisor_gap_cm NUMERIC(3,1),
    neck_rom VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (neck_rom IN ('full', 'reduced', 'severely-limited', '')),
    cervical_spine_stability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cervical_spine_stability IN ('stable', 'limited', 'unstable', '')),
    dentition VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dentition IN ('good', 'loose-teeth', 'caps-crowns', 'edentulous', 'dentures', '')),
    beard VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (beard IN ('yes', 'no', '')),
    upper_lip_bite_test VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (upper_lip_bite_test IN ('I', 'II', 'III', '')),
    prior_difficult_intubation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (prior_difficult_intubation IN ('yes', 'no', '')),

    -- STOP-BANG components (each scored 0 or 1)
    stopbang_snoring VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopbang_snoring IN ('yes', 'no', '')),
    stopbang_tired VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopbang_tired IN ('yes', 'no', '')),
    stopbang_observed_apnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopbang_observed_apnoea IN ('yes', 'no', '')),
    stopbang_pressure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopbang_pressure IN ('yes', 'no', '')),
    stopbang_bmi_gt35 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopbang_bmi_gt35 IN ('yes', 'no', '')),
    stopbang_age_gt50 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopbang_age_gt50 IN ('yes', 'no', '')),
    stopbang_neck_gt40 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopbang_neck_gt40 IN ('yes', 'no', '')),
    stopbang_male VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stopbang_male IN ('yes', 'no', '')),

    airway_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_airway_updated_at
    BEFORE UPDATE ON assessment_airway
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_airway IS
    'Step 4: airway examination including Mallampati, thyromental distance, mouth opening, neck ROM, dentition, and STOP-BANG OSA screening.';
COMMENT ON COLUMN assessment_airway.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_airway.mallampati_class IS
    'Mallampati airway class: I, II, III, IV.';
COMMENT ON COLUMN assessment_airway.thyromental_distance_cm IS
    'Thyromental distance in centimetres (chin to thyroid notch, neck extended). < 6 cm predicts difficult intubation.';
COMMENT ON COLUMN assessment_airway.mouth_opening_cm IS
    'Maximum mouth opening in centimetres.';
COMMENT ON COLUMN assessment_airway.inter_incisor_gap_cm IS
    'Inter-incisor gap in centimetres. < 3 cm is abnormal.';
COMMENT ON COLUMN assessment_airway.neck_rom IS
    'Neck range of motion: full, reduced, severely-limited.';
COMMENT ON COLUMN assessment_airway.cervical_spine_stability IS
    'Cervical spine stability: stable, limited, unstable.';
COMMENT ON COLUMN assessment_airway.dentition IS
    'Dentition condition: good, loose-teeth, caps-crowns, edentulous, dentures.';
COMMENT ON COLUMN assessment_airway.beard IS
    'Presence of a beard that may impede mask ventilation.';
COMMENT ON COLUMN assessment_airway.upper_lip_bite_test IS
    'Upper-lip bite test: I (lower incisors cover upper lip), II (partial), III (cannot reach).';
COMMENT ON COLUMN assessment_airway.prior_difficult_intubation IS
    'Documented history of difficult intubation.';
COMMENT ON COLUMN assessment_airway.stopbang_snoring IS
    'STOP-BANG S: loud snoring heard through a closed door.';
COMMENT ON COLUMN assessment_airway.stopbang_tired IS
    'STOP-BANG T: tired or sleepy during daytime.';
COMMENT ON COLUMN assessment_airway.stopbang_observed_apnoea IS
    'STOP-BANG O: observed apnoea during sleep.';
COMMENT ON COLUMN assessment_airway.stopbang_pressure IS
    'STOP-BANG P: treated for hypertension.';
COMMENT ON COLUMN assessment_airway.stopbang_bmi_gt35 IS
    'STOP-BANG B: BMI > 35 kg/m^2.';
COMMENT ON COLUMN assessment_airway.stopbang_age_gt50 IS
    'STOP-BANG A: age > 50 years.';
COMMENT ON COLUMN assessment_airway.stopbang_neck_gt40 IS
    'STOP-BANG N: neck circumference > 40 cm.';
COMMENT ON COLUMN assessment_airway.stopbang_male IS
    'STOP-BANG G: gender male.';
COMMENT ON COLUMN assessment_airway.airway_notes IS
    'Free-text clinician notes on airway.';
