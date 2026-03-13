-- 09_assessment_current_management.sql
-- Current management section: medications, therapies, and avoidance strategies.

CREATE TABLE assessment_current_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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
    allergen_avoidance_strategies TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_management_updated_at
    BEFORE UPDATE ON assessment_current_management
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_management IS
    'Current allergy management: medications, immunotherapy, biologics, and avoidance strategies. One-to-one child of assessment.';

-- Other medications (one-to-many child)
CREATE TABLE assessment_other_medication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    current_management_id UUID NOT NULL
        REFERENCES assessment_current_management(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(255) NOT NULL DEFAULT '',
    frequency VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_other_medication_updated_at
    BEFORE UPDATE ON assessment_other_medication
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_other_medication IS
    'Other medications the patient is taking, with name, dose, and frequency.';
