-- ============================================================
-- 07_assessment_iron_studies.sql
-- Step 5: Iron Studies (1:1 with assessment).
-- ============================================================
-- Iron metabolism panel including serum iron, TIBC,
-- transferrin saturation, ferritin, and reticulocyte count.
-- ============================================================

CREATE TABLE assessment_iron_studies (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Iron studies fields
    serum_iron                  NUMERIC(6,1) CHECK (serum_iron IS NULL OR (serum_iron >= 0 AND serum_iron <= 500)),
    total_iron_binding_capacity NUMERIC(6,1) CHECK (total_iron_binding_capacity IS NULL OR (total_iron_binding_capacity >= 0 AND total_iron_binding_capacity <= 1000)),
    transferrin_saturation      NUMERIC(5,1) CHECK (transferrin_saturation IS NULL OR (transferrin_saturation >= 0 AND transferrin_saturation <= 100)),
    serum_ferritin              NUMERIC(8,1) CHECK (serum_ferritin IS NULL OR (serum_ferritin >= 0 AND serum_ferritin <= 100000)),
    reticulocyte_count          NUMERIC(5,2) CHECK (reticulocyte_count IS NULL OR (reticulocyte_count >= 0 AND reticulocyte_count <= 30)),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_iron_studies_updated_at
    BEFORE UPDATE ON assessment_iron_studies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_iron_studies IS
    '1:1 with assessment. Step 5: Iron Studies - serum iron, TIBC, transferrin saturation, ferritin, reticulocytes.';
COMMENT ON COLUMN assessment_iron_studies.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_iron_studies.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_iron_studies.serum_iron IS
    'Serum iron in mcg/dL. Normal: 60-170 mcg/dL. NULL if unanswered.';
COMMENT ON COLUMN assessment_iron_studies.total_iron_binding_capacity IS
    'Total iron-binding capacity in mcg/dL. Normal: 250-370 mcg/dL. NULL if unanswered.';
COMMENT ON COLUMN assessment_iron_studies.transferrin_saturation IS
    'Transferrin saturation percentage. Normal: 20-50%. NULL if unanswered.';
COMMENT ON COLUMN assessment_iron_studies.serum_ferritin IS
    'Serum ferritin in ng/mL. Normal: 12-300 ng/mL. NULL if unanswered.';
COMMENT ON COLUMN assessment_iron_studies.reticulocyte_count IS
    'Reticulocyte count percentage. Normal: 0.5-2.5%. NULL if unanswered.';
COMMENT ON COLUMN assessment_iron_studies.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_iron_studies.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
