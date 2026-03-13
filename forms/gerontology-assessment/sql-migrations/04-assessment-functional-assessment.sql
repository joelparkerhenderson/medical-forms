-- 04_assessment_functional_assessment.sql
-- Functional assessment section of the gerontology assessment.

CREATE TABLE assessment_functional_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    bathing_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bathing_independence IN ('independent', 'needs-assistance', 'dependent', '')),
    dressing_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dressing_independence IN ('independent', 'needs-assistance', 'dependent', '')),
    toileting_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (toileting_independence IN ('independent', 'needs-assistance', 'dependent', '')),
    transferring_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (transferring_independence IN ('independent', 'needs-assistance', 'dependent', '')),
    feeding_independence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (feeding_independence IN ('independent', 'needs-assistance', 'dependent', '')),
    continence_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (continence_status IN ('continent', 'occasional-incontinence', 'incontinent', '')),
    cooking_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cooking_ability IN ('independent', 'needs-assistance', 'unable', '')),
    shopping_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (shopping_ability IN ('independent', 'needs-assistance', 'unable', '')),
    housework_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (housework_ability IN ('independent', 'needs-assistance', 'unable', '')),
    medication_management VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_management IN ('independent', 'needs-prompting', 'managed-by-carer', '')),
    telephone_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (telephone_use IN ('independent', 'needs-assistance', 'unable', '')),
    finances_management VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (finances_management IN ('independent', 'needs-assistance', 'managed-by-other', '')),
    barthel_index_score INTEGER
        CHECK (barthel_index_score IS NULL OR (barthel_index_score >= 0 AND barthel_index_score <= 20)),
    additional_functional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_assessment_updated_at
    BEFORE UPDATE ON assessment_functional_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_assessment IS
    'Functional assessment section: activities of daily living (ADLs) and instrumental ADLs with Barthel Index. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_assessment.bathing_independence IS
    'Bathing independence level: independent, needs-assistance, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.dressing_independence IS
    'Dressing independence level: independent, needs-assistance, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.toileting_independence IS
    'Toileting independence level: independent, needs-assistance, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.transferring_independence IS
    'Transferring (bed to chair) independence level: independent, needs-assistance, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.feeding_independence IS
    'Feeding independence level: independent, needs-assistance, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.continence_status IS
    'Continence status: continent, occasional-incontinence, incontinent, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.cooking_ability IS
    'Ability to cook meals: independent, needs-assistance, unable, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.shopping_ability IS
    'Ability to do shopping: independent, needs-assistance, unable, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.housework_ability IS
    'Ability to do housework: independent, needs-assistance, unable, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.medication_management IS
    'Medication management ability: independent, needs-prompting, managed-by-carer, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.telephone_use IS
    'Ability to use telephone: independent, needs-assistance, unable, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.finances_management IS
    'Financial management ability: independent, needs-assistance, managed-by-other, or empty string.';
COMMENT ON COLUMN assessment_functional_assessment.barthel_index_score IS
    'Barthel Index of ADL score (0-20), NULL if not assessed.';
COMMENT ON COLUMN assessment_functional_assessment.additional_functional_notes IS
    'Free-text notes on functional status.';
