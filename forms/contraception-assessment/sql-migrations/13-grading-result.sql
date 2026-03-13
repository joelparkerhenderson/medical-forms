-- 13_grading_result.sql
-- Stores the computed UKMEC grading result for a contraception assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    overall_highest_ukmec_category INTEGER NOT NULL DEFAULT 1
        CHECK (overall_highest_ukmec_category >= 1 AND overall_highest_ukmec_category <= 4),
    ukmec_cocp INTEGER
        CHECK (ukmec_cocp IS NULL OR (ukmec_cocp >= 1 AND ukmec_cocp <= 4)),
    ukmec_pop INTEGER
        CHECK (ukmec_pop IS NULL OR (ukmec_pop >= 1 AND ukmec_pop <= 4)),
    ukmec_patch INTEGER
        CHECK (ukmec_patch IS NULL OR (ukmec_patch >= 1 AND ukmec_patch <= 4)),
    ukmec_ring INTEGER
        CHECK (ukmec_ring IS NULL OR (ukmec_ring >= 1 AND ukmec_ring <= 4)),
    ukmec_injection INTEGER
        CHECK (ukmec_injection IS NULL OR (ukmec_injection >= 1 AND ukmec_injection <= 4)),
    ukmec_implant INTEGER
        CHECK (ukmec_implant IS NULL OR (ukmec_implant >= 1 AND ukmec_implant <= 4)),
    ukmec_cu_iud INTEGER
        CHECK (ukmec_cu_iud IS NULL OR (ukmec_cu_iud >= 1 AND ukmec_cu_iud <= 4)),
    ukmec_lng_ius INTEGER
        CHECK (ukmec_lng_ius IS NULL OR (ukmec_lng_ius >= 1 AND ukmec_lng_ius <= 4)),
    ukmec_condom_male INTEGER
        CHECK (ukmec_condom_male IS NULL OR (ukmec_condom_male >= 1 AND ukmec_condom_male <= 4)),
    ukmec_condom_female INTEGER
        CHECK (ukmec_condom_female IS NULL OR (ukmec_condom_female >= 1 AND ukmec_condom_female <= 4)),
    ukmec_diaphragm INTEGER
        CHECK (ukmec_diaphragm IS NULL OR (ukmec_diaphragm >= 1 AND ukmec_diaphragm <= 4)),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed UKMEC grading result per contraceptive method. UKMEC 1 = no restriction, 2 = advantages outweigh risks, 3 = risks outweigh advantages, 4 = unacceptable health risk. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.overall_highest_ukmec_category IS
    'Highest UKMEC category across all methods (1-4).';
COMMENT ON COLUMN grading_result.ukmec_cocp IS
    'UKMEC category for combined oral contraceptive pill (1-4).';
COMMENT ON COLUMN grading_result.ukmec_pop IS
    'UKMEC category for progestogen-only pill (1-4).';
COMMENT ON COLUMN grading_result.ukmec_patch IS
    'UKMEC category for contraceptive patch (1-4).';
COMMENT ON COLUMN grading_result.ukmec_ring IS
    'UKMEC category for vaginal ring (1-4).';
COMMENT ON COLUMN grading_result.ukmec_injection IS
    'UKMEC category for progestogen-only injectable (1-4).';
COMMENT ON COLUMN grading_result.ukmec_implant IS
    'UKMEC category for subdermal implant (1-4).';
COMMENT ON COLUMN grading_result.ukmec_cu_iud IS
    'UKMEC category for copper intrauterine device (1-4).';
COMMENT ON COLUMN grading_result.ukmec_lng_ius IS
    'UKMEC category for levonorgestrel intrauterine system (1-4).';
COMMENT ON COLUMN grading_result.ukmec_condom_male IS
    'UKMEC category for male condom (1-4).';
COMMENT ON COLUMN grading_result.ukmec_condom_female IS
    'UKMEC category for female condom (1-4).';
COMMENT ON COLUMN grading_result.ukmec_diaphragm IS
    'UKMEC category for diaphragm or cap (1-4).';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
