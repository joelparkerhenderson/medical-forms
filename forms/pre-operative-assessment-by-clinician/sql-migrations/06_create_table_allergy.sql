CREATE TABLE allergy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    scientific_name TEXT NOT NULL DEFAULT '',
    european_union_name TEXT NOT NULL DEFAULT '',
    united_states_name TEXT NOT NULL DEFAULT '',
    cosmetic_name TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_allergy_updated_at
    BEFORE UPDATE ON allergy
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE allergy IS
    'Allergy';
COMMENT ON COLUMN allergy.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN allergy.created_at IS
    'Timestamp when the record was created.';
COMMENT ON COLUMN allergy.updated_at IS
    'Timestamp when the record was updated.';
COMMENT ON COLUMN allergy.deleted_at IS
    'Timestamp when the record was deleted.';
COMMENT ON COLUMN allergy.scientific_name IS
    'Scientific name of the allergen, following WHO/IUIS taxonomy (e.g. Betula pendula for birch pollen).';
COMMENT ON COLUMN allergy.european_union_name IS
    'European Union name of the allergen, following EU FSA major food allergen list (e.g. wheat).';
COMMENT ON COLUMN allergy.united_states_name IS
    'United States name of the allergen, following US FDA major food allergen list (e.g. wheat).';
COMMENT ON COLUMN allergy.cosmetic_name IS
    'Cosmetic name of the allergen, following cosmetic ingredient regulations (e.g. Limonene).';

CREATE INDEX allergy_index_gto
    ON allergy
    USING GIN ((
        scientific_name
            || ' ' ||
        european_union_name
            || ' ' ||
        united_states_name
            || ' ' ||
        cosmetic_name
    ) gin_trgm_ops);
