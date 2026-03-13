-- 05_assessment_self_care_activities.sql
-- Self-care activities section of the occupational therapy assessment (COPM domain).

CREATE TABLE assessment_self_care_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    personal_care_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (personal_care_independence IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    dressing_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dressing_ability IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    bathing_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bathing_ability IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    feeding_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (feeding_ability IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    toileting_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (toileting_ability IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    mobility_indoors VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mobility_indoors IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    medication_management VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_management IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    self_care_concerns TEXT NOT NULL DEFAULT '',
    assistive_devices_used TEXT NOT NULL DEFAULT '',
    self_care_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_self_care_activities_updated_at
    BEFORE UPDATE ON assessment_self_care_activities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_self_care_activities IS
    'Self-care activities section: independence levels across personal care, dressing, bathing, feeding, toileting, and mobility. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_self_care_activities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_self_care_activities.personal_care_independence IS
    'Independence level for general personal care using FIM scale categories.';
COMMENT ON COLUMN assessment_self_care_activities.dressing_ability IS
    'Independence level for dressing upper and lower body.';
COMMENT ON COLUMN assessment_self_care_activities.bathing_ability IS
    'Independence level for bathing and showering.';
COMMENT ON COLUMN assessment_self_care_activities.feeding_ability IS
    'Independence level for eating and drinking.';
COMMENT ON COLUMN assessment_self_care_activities.toileting_ability IS
    'Independence level for toileting and continence management.';
COMMENT ON COLUMN assessment_self_care_activities.mobility_indoors IS
    'Independence level for indoor mobility and transfers.';
COMMENT ON COLUMN assessment_self_care_activities.medication_management IS
    'Independence level for managing medications.';
COMMENT ON COLUMN assessment_self_care_activities.self_care_concerns IS
    'Free-text description of specific self-care concerns identified by the patient.';
COMMENT ON COLUMN assessment_self_care_activities.assistive_devices_used IS
    'List of assistive devices currently used for self-care activities.';
COMMENT ON COLUMN assessment_self_care_activities.self_care_notes IS
    'Additional clinician notes on self-care performance.';
