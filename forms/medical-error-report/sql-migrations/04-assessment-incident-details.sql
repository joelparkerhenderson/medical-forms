-- 04_assessment_incident_details.sql
-- Incident details section of the medical error report.

CREATE TABLE assessment_incident_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    incident_date DATE,
    incident_time TIME,
    discovery_date DATE,
    discovery_time TIME,
    location_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (location_type IN ('inpatient-ward', 'outpatient-clinic', 'emergency-department', 'operating-theatre', 'pharmacy', 'laboratory', 'radiology', 'community', 'other', '')),
    location_details TEXT NOT NULL DEFAULT '',
    incident_summary TEXT NOT NULL DEFAULT '',
    incident_witnessed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (incident_witnessed IN ('yes', 'no', '')),
    witness_details TEXT NOT NULL DEFAULT '',
    shift_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (shift_type IN ('day', 'evening', 'night', 'weekend', 'bank-holiday', '')),
    staffing_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (staffing_level IN ('adequate', 'understaffed', 'overstaffed', 'unknown', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_incident_details_updated_at
    BEFORE UPDATE ON assessment_incident_details
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_incident_details IS
    'Incident details section: date, time, location, circumstances. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_incident_details.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_incident_details.incident_date IS
    'Date the incident occurred.';
COMMENT ON COLUMN assessment_incident_details.incident_time IS
    'Time the incident occurred.';
COMMENT ON COLUMN assessment_incident_details.discovery_date IS
    'Date the error was discovered.';
COMMENT ON COLUMN assessment_incident_details.discovery_time IS
    'Time the error was discovered.';
COMMENT ON COLUMN assessment_incident_details.location_type IS
    'Type of location: inpatient-ward, outpatient-clinic, emergency-department, etc.';
COMMENT ON COLUMN assessment_incident_details.location_details IS
    'Specific location details (ward name, room number, etc.).';
COMMENT ON COLUMN assessment_incident_details.incident_summary IS
    'Brief narrative summary of what happened.';
COMMENT ON COLUMN assessment_incident_details.incident_witnessed IS
    'Whether the incident was witnessed: yes, no, or empty.';
COMMENT ON COLUMN assessment_incident_details.witness_details IS
    'Names and roles of witnesses.';
COMMENT ON COLUMN assessment_incident_details.shift_type IS
    'Shift during which incident occurred: day, evening, night, weekend, bank-holiday, or empty.';
COMMENT ON COLUMN assessment_incident_details.staffing_level IS
    'Staffing level at time of incident: adequate, understaffed, overstaffed, unknown, or empty.';
