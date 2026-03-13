-- ============================================================
-- 11_assessment_musculoskeletal_airway.sql
-- Musculoskeletal & airway subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the MusculoskeletalAirway TypeScript
-- interface. Critical for airway management planning.
-- ============================================================

CREATE TABLE assessment_musculoskeletal_airway (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Rheumatoid arthritis (relevant for atlanto-axial stability)
    rheumatoid_arthritis        TEXT NOT NULL DEFAULT ''
                                CHECK (rheumatoid_arthritis IN ('yes', 'no', '')),

    -- Cervical spine
    cervical_spine_issues       TEXT NOT NULL DEFAULT ''
                                CHECK (cervical_spine_issues IN ('yes', 'no', '')),
    limited_neck_movement       TEXT NOT NULL DEFAULT ''
                                CHECK (limited_neck_movement IN ('yes', 'no', '')),

    -- Mouth / dental
    limited_mouth_opening       TEXT NOT NULL DEFAULT ''
                                CHECK (limited_mouth_opening IN ('yes', 'no', '')),
    dental_issues               TEXT NOT NULL DEFAULT ''
                                CHECK (dental_issues IN ('yes', 'no', '')),
    dental_details              TEXT NOT NULL DEFAULT '',

    -- Previous difficult airway
    previous_difficult_airway   TEXT NOT NULL DEFAULT ''
                                CHECK (previous_difficult_airway IN ('yes', 'no', '')),

    -- Mallampati score (assessed by clinician)
    mallampati_score            TEXT NOT NULL DEFAULT ''
                                CHECK (mallampati_score IN ('1', '2', '3', '4', '')),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_musculoskeletal_airway_updated_at
    BEFORE UPDATE ON assessment_musculoskeletal_airway
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_musculoskeletal_airway IS
    '1:1 with assessment. Musculoskeletal and airway assessment data, critical for airway management planning.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_musculoskeletal_airway.rheumatoid_arthritis IS
    'Does the patient have rheumatoid arthritis? yes/no/empty. Relevant for atlanto-axial instability.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.cervical_spine_issues IS
    'Does the patient have cervical spine issues? yes/no/empty.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.limited_neck_movement IS
    'Does the patient have limited neck movement? yes/no/empty.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.limited_mouth_opening IS
    'Does the patient have limited mouth opening? yes/no/empty.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.dental_issues IS
    'Does the patient have dental issues (loose teeth, crowns, etc.)? yes/no/empty.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.dental_details IS
    'Free-text details about dental issues.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.previous_difficult_airway IS
    'Has the patient had a previous difficult airway? yes/no/empty.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.mallampati_score IS
    'Mallampati airway classification score: 1-4 or empty.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_musculoskeletal_airway.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
