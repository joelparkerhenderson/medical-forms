CREATE TABLE assessment_family_pedigree (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    total_first_degree_relatives INTEGER
        CHECK (total_first_degree_relatives IS NULL OR total_first_degree_relatives >= 0),
    total_second_degree_relatives INTEGER
        CHECK (total_second_degree_relatives IS NULL OR total_second_degree_relatives >= 0),
    consanguinity_in_family VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consanguinity_in_family IN ('yes', 'no', '')),
    consanguinity_details TEXT NOT NULL DEFAULT '',
    adoption_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (adoption_status IN ('not-adopted', 'adopted-known-history', 'adopted-unknown-history', '')),
    pedigree_notes TEXT NOT NULL DEFAULT '',
    three_generation_pedigree_drawn VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (three_generation_pedigree_drawn IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_family_pedigree_updated_at
    BEFORE UPDATE ON assessment_family_pedigree
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Individual family member entries for the pedigree (one-to-many child)

COMMENT ON TABLE assessment_family_pedigree IS
    'Assessment family pedigree.';
COMMENT ON COLUMN assessment_family_pedigree.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_family_pedigree.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_family_pedigree.total_first_degree_relatives IS
    'Total first degree relatives.';
COMMENT ON COLUMN assessment_family_pedigree.total_second_degree_relatives IS
    'Total second degree relatives.';
COMMENT ON COLUMN assessment_family_pedigree.consanguinity_in_family IS
    'Consanguinity in family. One of: yes, no.';
COMMENT ON COLUMN assessment_family_pedigree.consanguinity_details IS
    'Consanguinity details.';
COMMENT ON COLUMN assessment_family_pedigree.adoption_status IS
    'Adoption status. One of: not-adopted, adopted-known-history, adopted-unknown-history.';
COMMENT ON COLUMN assessment_family_pedigree.pedigree_notes IS
    'Pedigree notes.';
COMMENT ON COLUMN assessment_family_pedigree.three_generation_pedigree_drawn IS
    'Three generation pedigree drawn. One of: yes, no.';
COMMENT ON COLUMN assessment_family_pedigree.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_family_pedigree.updated_at IS
    'Timestamp when this row was last updated.';
