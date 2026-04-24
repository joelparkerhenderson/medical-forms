CREATE TABLE assessment_current_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    antihistamines VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antihistamines IN ('yes', 'no', '')),
    antihistamine_details TEXT NOT NULL DEFAULT '',
    nasal_steroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nasal_steroids IN ('yes', 'no', '')),
    adrenaline_auto_injector VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (adrenaline_auto_injector IN ('yes', 'no', '')),
    immunotherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (immunotherapy IN ('yes', 'no', '')),
    immunotherapy_details TEXT NOT NULL DEFAULT '',
    biologics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (biologics IN ('yes', 'no', '')),
    biologic_details TEXT NOT NULL DEFAULT '',
    allergen_avoidance_strategies TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_assessment_current_management_updated_at
    BEFORE UPDATE ON assessment_current_management
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_management IS
    'Current allergy management: medications, immunotherapy, biologics, and avoidance strategies. One-to-one child of assessment.';

-- Other medications (one-to-many child)

COMMENT ON COLUMN assessment_current_management.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_current_management.antihistamines IS
    'Antihistamines. One of: yes, no.';
COMMENT ON COLUMN assessment_current_management.antihistamine_details IS
    'Antihistamine details.';
COMMENT ON COLUMN assessment_current_management.nasal_steroids IS
    'Nasal steroids. One of: yes, no.';
COMMENT ON COLUMN assessment_current_management.adrenaline_auto_injector IS
    'Adrenaline auto injector. One of: yes, no.';
COMMENT ON COLUMN assessment_current_management.immunotherapy IS
    'Immunotherapy. One of: yes, no.';
COMMENT ON COLUMN assessment_current_management.immunotherapy_details IS
    'Immunotherapy details.';
COMMENT ON COLUMN assessment_current_management.biologics IS
    'Biologics. One of: yes, no.';
COMMENT ON COLUMN assessment_current_management.biologic_details IS
    'Biologic details.';
COMMENT ON COLUMN assessment_current_management.allergen_avoidance_strategies IS
    'Allergen avoidance strategies.';
COMMENT ON COLUMN assessment_current_management.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_management.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_management.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_current_management.deleted_at IS
    'Timestamp when this row was deleted.';
