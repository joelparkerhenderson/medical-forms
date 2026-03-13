-- 06_assessment_dmft.sql
-- Step 4: DMFT (Decayed, Missing, Filled Teeth) index assessment.

CREATE TABLE assessment_dmft (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    decayed_teeth INTEGER
        CHECK (decayed_teeth IS NULL OR (decayed_teeth >= 0 AND decayed_teeth <= 28)),
    missing_teeth INTEGER
        CHECK (missing_teeth IS NULL OR (missing_teeth >= 0 AND missing_teeth <= 28)),
    filled_teeth INTEGER
        CHECK (filled_teeth IS NULL OR (filled_teeth >= 0 AND filled_teeth <= 28)),
    dmft_total INTEGER
        CHECK (dmft_total IS NULL OR (dmft_total >= 0 AND dmft_total <= 28)),
    decayed_tooth_numbers TEXT NOT NULL DEFAULT '',
    missing_tooth_numbers TEXT NOT NULL DEFAULT '',
    filled_tooth_numbers TEXT NOT NULL DEFAULT '',
    caries_activity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (caries_activity IN ('active', 'arrested', 'none', '')),
    notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_dmft_updated_at
    BEFORE UPDATE ON assessment_dmft
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_dmft IS
    'Step 4 DMFT Assessment: Decayed, Missing, Filled Teeth index for permanent dentition (range 0-28). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_dmft.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_dmft.decayed_teeth IS
    'Number of decayed (D) permanent teeth, 0-28.';
COMMENT ON COLUMN assessment_dmft.missing_teeth IS
    'Number of missing (M) permanent teeth, 0-28.';
COMMENT ON COLUMN assessment_dmft.filled_teeth IS
    'Number of filled (F) permanent teeth, 0-28.';
COMMENT ON COLUMN assessment_dmft.dmft_total IS
    'Total DMFT score: sum of D + M + F, 0-28.';
COMMENT ON COLUMN assessment_dmft.decayed_tooth_numbers IS
    'Comma-separated FDI tooth numbers for decayed teeth.';
COMMENT ON COLUMN assessment_dmft.missing_tooth_numbers IS
    'Comma-separated FDI tooth numbers for missing teeth.';
COMMENT ON COLUMN assessment_dmft.filled_tooth_numbers IS
    'Comma-separated FDI tooth numbers for filled teeth.';
COMMENT ON COLUMN assessment_dmft.caries_activity IS
    'Current caries activity status: active, arrested, none, or empty.';
COMMENT ON COLUMN assessment_dmft.notes IS
    'Additional clinical notes regarding the DMFT assessment.';
