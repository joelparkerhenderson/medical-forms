-- 18-assessment-anaesthesia-plan.sql
-- Step 15: anaesthesia and post-operative plan.

CREATE TABLE assessment_anaesthesia_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    technique VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (technique IN ('ga', 'regional', 'neuraxial', 'sedation', 'mac', 'local', 'combined-ga-regional', '')),
    airway_plan VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (airway_plan IN ('face-mask', 'supraglottic', 'ett', 'awake-fibreoptic', 'surgical-airway', '')),
    rsi_planned VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rsi_planned IN ('yes', 'no', '')),
    monitoring_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (monitoring_level IN ('standard', 'invasive-arterial', 'invasive-cvc', 'cardiac-output', '')),

    analgesia_plan VARCHAR(500) NOT NULL DEFAULT '',
    regional_block_planned VARCHAR(100) NOT NULL DEFAULT '',
    dvt_prophylaxis VARCHAR(100) NOT NULL DEFAULT '',
    antibiotic_prophylaxis VARCHAR(100) NOT NULL DEFAULT '',

    post_op_disposition VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (post_op_disposition IN ('day-case', 'ward', 'enhanced-care', 'hdu', 'icu', '')),
    anticipated_length_of_stay_days INTEGER,

    special_equipment VARCHAR(500) NOT NULL DEFAULT '',
    blood_products_required VARCHAR(100) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_anaesthesia_plan_updated_at
    BEFORE UPDATE ON assessment_anaesthesia_plan
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anaesthesia_plan IS
    'Step 15: proposed anaesthetic technique, airway plan, monitoring level, analgesia, prophylaxis, and post-op disposition.';
COMMENT ON COLUMN assessment_anaesthesia_plan.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_anaesthesia_plan.technique IS
    'Technique: ga, regional, neuraxial, sedation, mac, local, combined-ga-regional.';
COMMENT ON COLUMN assessment_anaesthesia_plan.airway_plan IS
    'Airway plan: face-mask, supraglottic, ett, awake-fibreoptic, surgical-airway.';
COMMENT ON COLUMN assessment_anaesthesia_plan.rsi_planned IS
    'Whether rapid-sequence induction is planned.';
COMMENT ON COLUMN assessment_anaesthesia_plan.monitoring_level IS
    'Monitoring level: standard (AAGBI), invasive-arterial, invasive-cvc, cardiac-output.';
COMMENT ON COLUMN assessment_anaesthesia_plan.analgesia_plan IS
    'Free-text analgesia plan (opioid-sparing multimodal).';
COMMENT ON COLUMN assessment_anaesthesia_plan.regional_block_planned IS
    'Specific regional block planned (if any).';
COMMENT ON COLUMN assessment_anaesthesia_plan.dvt_prophylaxis IS
    'Deep vein thrombosis prophylaxis plan (mechanical, LMWH, etc.).';
COMMENT ON COLUMN assessment_anaesthesia_plan.antibiotic_prophylaxis IS
    'Peri-operative antibiotic prophylaxis plan.';
COMMENT ON COLUMN assessment_anaesthesia_plan.post_op_disposition IS
    'Post-operative disposition: day-case, ward, enhanced-care, hdu, icu.';
COMMENT ON COLUMN assessment_anaesthesia_plan.anticipated_length_of_stay_days IS
    'Anticipated length of stay in days.';
COMMENT ON COLUMN assessment_anaesthesia_plan.special_equipment IS
    'Special equipment required (difficult-airway trolley, cell-saver, etc.).';
COMMENT ON COLUMN assessment_anaesthesia_plan.blood_products_required IS
    'Blood products planned to be available.';
