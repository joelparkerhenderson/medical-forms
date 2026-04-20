-- 07_assessment_equipment_vehicle.sql
-- Equipment and vehicle competency section of the first responder assessment.

CREATE TABLE assessment_equipment_vehicle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    defibrillator_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (defibrillator_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    monitor_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (monitor_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    ventilator_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ventilator_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    suction_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (suction_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    stretcher_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stretcher_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    scoop_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (scoop_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    ambulance_driving VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ambulance_driving IN ('not-competent', 'developing', 'competent', 'expert', '')),
    emergency_driving VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (emergency_driving IN ('not-competent', 'developing', 'competent', 'expert', '')),
    vehicle_daily_inspection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vehicle_daily_inspection IN ('yes', 'no', '')),
    equipment_check_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (equipment_check_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    radio_communications VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (radio_communications IN ('not-competent', 'developing', 'competent', 'expert', '')),
    equipment_vehicle_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_equipment_vehicle_updated_at
    BEFORE UPDATE ON assessment_equipment_vehicle
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_equipment_vehicle IS
    'Equipment and vehicle competency section: medical devices, ambulance driving, equipment checks, and radio use. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_equipment_vehicle.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_equipment_vehicle.defibrillator_competency IS
    'Defibrillator (AED/manual) competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.monitor_competency IS
    'Patient monitor competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.ventilator_competency IS
    'Ventilator competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.suction_competency IS
    'Suction device competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.stretcher_competency IS
    'Stretcher and trolley competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.scoop_competency IS
    'Scoop stretcher and spinal board competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.ambulance_driving IS
    'Standard ambulance driving competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.emergency_driving IS
    'Emergency (blue light) driving competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.vehicle_daily_inspection IS
    'Whether the responder completes daily vehicle inspections: yes, no, or empty.';
COMMENT ON COLUMN assessment_equipment_vehicle.equipment_check_competency IS
    'Equipment check and inventory competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.radio_communications IS
    'Radio communications competency level.';
COMMENT ON COLUMN assessment_equipment_vehicle.equipment_vehicle_notes IS
    'Additional notes on equipment and vehicle competency.';
