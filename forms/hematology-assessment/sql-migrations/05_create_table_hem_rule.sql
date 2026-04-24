CREATE TABLE hem_rule (
    -- Rule identifier (e.g. HEM-001)
    id              TEXT PRIMARY KEY,

    -- Rule metadata
    category        TEXT NOT NULL,
    description     TEXT NOT NULL,
    concern_level   TEXT NOT NULL CHECK (concern_level IN ('high', 'medium', 'low')),

    -- Audit timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_hem_rule_updated_at
    BEFORE UPDATE ON hem_rule
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Seed all 20 hematology rules
-- ──────────────────────────────────────────────────────────────

-- HIGH CONCERN (HEM-001 to HEM-005)
INSERT INTO hem_rule (id, category, description, concern_level) VALUES
    ('HEM-001', 'Blood Count',  'Critical hemoglobin level (<7 g/dL) - severe anemia',                          'high'),
    ('HEM-002', 'Blood Count',  'Severe thrombocytopenia (platelets <20 x10^9/L) - bleeding risk',              'high'),
    ('HEM-003', 'Blood Count',  'Severe leukocytosis (WBC >30 x10^9/L) - possible malignancy',                 'high'),
    ('HEM-004', 'Coagulation',  'Critically elevated INR (>4.0) - major hemorrhage risk',                       'high'),
    ('HEM-005', 'Coagulation',  'Severely low fibrinogen (<100 mg/dL) - DIC risk',                              'high');

-- MEDIUM CONCERN (HEM-006 to HEM-014)
INSERT INTO hem_rule (id, category, description, concern_level) VALUES
    ('HEM-006', 'Blood Count',  'Moderate anemia (hemoglobin 7-10 g/dL)',                                       'medium'),
    ('HEM-007', 'Blood Count',  'Moderate thrombocytopenia (platelets 20-50 x10^9/L)',                          'medium'),
    ('HEM-008', 'Blood Count',  'Leukopenia (WBC <4.0 x10^9/L) - infection risk',                              'medium'),
    ('HEM-009', 'Blood Count',  'Microcytosis (MCV <80 fL) - possible iron deficiency',                        'medium'),
    ('HEM-010', 'Blood Count',  'Macrocytosis (MCV >100 fL) - possible B12/folate deficiency',                 'medium'),
    ('HEM-011', 'Coagulation',  'Elevated INR (1.5-4.0) - coagulopathy',                                       'medium'),
    ('HEM-012', 'Coagulation',  'Elevated D-dimer (>2.0 mg/L) - thrombotic concern',                           'medium'),
    ('HEM-013', 'Iron Studies', 'Severely depleted ferritin (<10 ng/mL) - iron deficiency',                     'medium'),
    ('HEM-014', 'Iron Studies', 'Iron overload (ferritin >500 ng/mL) - hemochromatosis risk',                   'medium');

-- LOW CONCERN (HEM-015 to HEM-020)
INSERT INTO hem_rule (id, category, description, concern_level) VALUES
    ('HEM-015', 'Blood Count',  'Mild anemia (hemoglobin 10-12 g/dL)',                                          'low'),
    ('HEM-016', 'Blood Count',  'Mild thrombocytopenia (platelets 100-150 x10^9/L)',                            'low'),
    ('HEM-017', 'Blood Count',  'Mild leukocytosis (WBC 11-15 x10^9/L)',                                       'low'),
    ('HEM-018', 'Coagulation',  'Mildly elevated aPTT (35-45 seconds)',                                         'low'),
    ('HEM-019', 'Iron Studies', 'Borderline low ferritin (10-30 ng/mL)',                                        'low'),
    ('HEM-020', 'Iron Studies', 'Elevated TIBC (>400 mcg/dL) - possible iron deficiency',                       'low');

COMMENT ON TABLE hem_rule IS
    'Catalogue of 20 hematology rules evaluated during grading.';
COMMENT ON COLUMN hem_rule.id IS
    'Rule identifier (e.g. HEM-001). Application-defined, not auto-generated.';
COMMENT ON COLUMN hem_rule.category IS
    'Clinical category (e.g. Blood Count, Coagulation, Iron Studies).';
COMMENT ON COLUMN hem_rule.description IS
    'Human-readable description of the rule condition.';
COMMENT ON COLUMN hem_rule.concern_level IS
    'Concern level: high, medium, or low.';
COMMENT ON COLUMN hem_rule.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN hem_rule.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
