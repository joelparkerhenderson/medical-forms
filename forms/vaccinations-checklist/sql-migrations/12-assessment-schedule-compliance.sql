-- 12_assessment_schedule_compliance.sql
-- Schedule and compliance section of the vaccinations checklist.

CREATE TABLE assessment_schedule_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    compliance_status VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (compliance_status IN ('fully-immunised', 'partially-immunised', 'non-compliant', 'contraindicated', '')),
    vaccines_due TEXT NOT NULL DEFAULT '',
    vaccines_overdue TEXT NOT NULL DEFAULT '',
    catch_up_plan_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (catch_up_plan_required IN ('yes', 'no', '')),
    catch_up_plan_details TEXT NOT NULL DEFAULT '',
    next_vaccination_date DATE,
    next_vaccination_type VARCHAR(255) NOT NULL DEFAULT '',
    occupational_health_clearance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (occupational_health_clearance IN ('yes', 'no', 'pending', '')),
    occupational_health_clearance_date DATE,
    exposure_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (exposure_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    active_exposure_incident VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (active_exposure_incident IN ('yes', 'no', '')),
    active_exposure_details TEXT NOT NULL DEFAULT '',
    consent_for_vaccination VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_for_vaccination IN ('yes', 'no', '')),
    consent_date DATE,
    schedule_compliance_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_schedule_compliance_updated_at
    BEFORE UPDATE ON assessment_schedule_compliance
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_schedule_compliance IS
    'Schedule and compliance section: compliance status, due/overdue vaccines, catch-up plan, OH clearance, exposure risk. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_schedule_compliance.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_schedule_compliance.compliance_status IS
    'Overall vaccination compliance: fully-immunised, partially-immunised, non-compliant, contraindicated, or empty.';
COMMENT ON COLUMN assessment_schedule_compliance.vaccines_due IS
    'Free-text list of vaccines currently due.';
COMMENT ON COLUMN assessment_schedule_compliance.vaccines_overdue IS
    'Free-text list of overdue vaccines.';
COMMENT ON COLUMN assessment_schedule_compliance.catch_up_plan_required IS
    'Whether a catch-up vaccination plan is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_schedule_compliance.catch_up_plan_details IS
    'Details of the catch-up vaccination plan.';
COMMENT ON COLUMN assessment_schedule_compliance.next_vaccination_date IS
    'Date of next scheduled vaccination.';
COMMENT ON COLUMN assessment_schedule_compliance.next_vaccination_type IS
    'Type/name of next scheduled vaccination.';
COMMENT ON COLUMN assessment_schedule_compliance.occupational_health_clearance IS
    'Whether occupational health clearance has been granted: yes, no, pending, or empty.';
COMMENT ON COLUMN assessment_schedule_compliance.occupational_health_clearance_date IS
    'Date of occupational health clearance.';
COMMENT ON COLUMN assessment_schedule_compliance.exposure_risk_level IS
    'Current exposure risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN assessment_schedule_compliance.active_exposure_incident IS
    'Whether there is an active exposure incident: yes, no, or empty.';
COMMENT ON COLUMN assessment_schedule_compliance.active_exposure_details IS
    'Details of active exposure incident.';
COMMENT ON COLUMN assessment_schedule_compliance.consent_for_vaccination IS
    'Whether the patient has consented to vaccination: yes, no, or empty.';
COMMENT ON COLUMN assessment_schedule_compliance.consent_date IS
    'Date consent was given for vaccination.';
COMMENT ON COLUMN assessment_schedule_compliance.schedule_compliance_notes IS
    'Additional notes on schedule and compliance.';
