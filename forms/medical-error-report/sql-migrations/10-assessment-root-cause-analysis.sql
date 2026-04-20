-- 10_assessment_root_cause_analysis.sql
-- Root cause analysis section of the medical error report.

CREATE TABLE assessment_root_cause_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    rca_conducted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rca_conducted IN ('yes', 'no', 'pending', '')),
    rca_date DATE,
    rca_lead VARCHAR(255) NOT NULL DEFAULT '',
    rca_team_members TEXT NOT NULL DEFAULT '',
    root_cause_category VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (root_cause_category IN ('human-error', 'system-failure', 'process-failure', 'communication', 'training', 'equipment', 'environmental', 'organisational', 'multiple', 'other', '')),
    root_cause_description TEXT NOT NULL DEFAULT '',
    five_whys_analysis TEXT NOT NULL DEFAULT '',
    fishbone_factors TEXT NOT NULL DEFAULT '',
    system_vulnerabilities TEXT NOT NULL DEFAULT '',
    similar_incidents VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (similar_incidents IN ('yes', 'no', 'unknown', '')),
    similar_incidents_details TEXT NOT NULL DEFAULT '',
    rca_findings_summary TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_root_cause_analysis_updated_at
    BEFORE UPDATE ON assessment_root_cause_analysis
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_root_cause_analysis IS
    'Root cause analysis section: structured investigation of underlying causes. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_root_cause_analysis.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_root_cause_analysis.rca_conducted IS
    'Whether RCA has been conducted: yes, no, pending, or empty.';
COMMENT ON COLUMN assessment_root_cause_analysis.rca_date IS
    'Date the RCA was conducted.';
COMMENT ON COLUMN assessment_root_cause_analysis.rca_lead IS
    'Name and role of the RCA lead.';
COMMENT ON COLUMN assessment_root_cause_analysis.rca_team_members IS
    'Names and roles of RCA team members.';
COMMENT ON COLUMN assessment_root_cause_analysis.root_cause_category IS
    'Primary root cause category: human-error, system-failure, process-failure, etc.';
COMMENT ON COLUMN assessment_root_cause_analysis.root_cause_description IS
    'Detailed description of the root cause.';
COMMENT ON COLUMN assessment_root_cause_analysis.five_whys_analysis IS
    'Five Whys analysis chain.';
COMMENT ON COLUMN assessment_root_cause_analysis.fishbone_factors IS
    'Ishikawa/fishbone diagram factors.';
COMMENT ON COLUMN assessment_root_cause_analysis.system_vulnerabilities IS
    'Identified system vulnerabilities.';
COMMENT ON COLUMN assessment_root_cause_analysis.similar_incidents IS
    'Whether similar incidents have occurred previously: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_root_cause_analysis.similar_incidents_details IS
    'Details of similar previous incidents.';
COMMENT ON COLUMN assessment_root_cause_analysis.rca_findings_summary IS
    'Summary of RCA findings and conclusions.';
