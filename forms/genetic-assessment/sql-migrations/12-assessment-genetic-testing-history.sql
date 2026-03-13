-- 12_assessment_genetic_testing_history.sql
-- Genetic testing history section of the genetic assessment.

CREATE TABLE assessment_genetic_testing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_genetic_testing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_genetic_testing IN ('yes', 'no', '')),
    previous_chromosomal_analysis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_chromosomal_analysis IN ('yes', 'no', '')),
    chromosomal_analysis_result TEXT NOT NULL DEFAULT '',
    previous_single_gene_test VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_single_gene_test IN ('yes', 'no', '')),
    single_gene_test_details TEXT NOT NULL DEFAULT '',
    previous_gene_panel VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_gene_panel IN ('yes', 'no', '')),
    gene_panel_details TEXT NOT NULL DEFAULT '',
    previous_whole_exome_sequencing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_whole_exome_sequencing IN ('yes', 'no', '')),
    wes_result TEXT NOT NULL DEFAULT '',
    previous_whole_genome_sequencing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_whole_genome_sequencing IN ('yes', 'no', '')),
    wgs_result TEXT NOT NULL DEFAULT '',
    previous_microarray VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_microarray IN ('yes', 'no', '')),
    microarray_result TEXT NOT NULL DEFAULT '',
    prenatal_testing_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (prenatal_testing_performed IN ('yes', 'no', '')),
    prenatal_testing_details TEXT NOT NULL DEFAULT '',
    family_member_testing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_member_testing IN ('yes', 'no', '')),
    family_member_testing_details TEXT NOT NULL DEFAULT '',
    consent_for_further_testing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_for_further_testing IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_genetic_testing_history_updated_at
    BEFORE UPDATE ON assessment_genetic_testing_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_genetic_testing_history IS
    'Genetic testing history section: previous genetic tests, results, and consent. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_genetic_testing_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_genetic_testing_history.previous_genetic_testing IS
    'Whether the patient has had any previous genetic testing: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.previous_chromosomal_analysis IS
    'Whether a chromosomal analysis (karyotype) was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.chromosomal_analysis_result IS
    'Result of chromosomal analysis.';
COMMENT ON COLUMN assessment_genetic_testing_history.previous_single_gene_test IS
    'Whether single gene testing was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.single_gene_test_details IS
    'Details and results of single gene testing.';
COMMENT ON COLUMN assessment_genetic_testing_history.previous_gene_panel IS
    'Whether a gene panel test was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.gene_panel_details IS
    'Details and results of gene panel testing.';
COMMENT ON COLUMN assessment_genetic_testing_history.previous_whole_exome_sequencing IS
    'Whether whole exome sequencing (WES) was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.wes_result IS
    'Result of whole exome sequencing.';
COMMENT ON COLUMN assessment_genetic_testing_history.previous_whole_genome_sequencing IS
    'Whether whole genome sequencing (WGS) was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.wgs_result IS
    'Result of whole genome sequencing.';
COMMENT ON COLUMN assessment_genetic_testing_history.previous_microarray IS
    'Whether chromosomal microarray analysis was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.microarray_result IS
    'Result of chromosomal microarray analysis.';
COMMENT ON COLUMN assessment_genetic_testing_history.prenatal_testing_performed IS
    'Whether prenatal genetic testing was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.prenatal_testing_details IS
    'Details of prenatal genetic testing (e.g. CVS, amniocentesis, NIPT).';
COMMENT ON COLUMN assessment_genetic_testing_history.family_member_testing IS
    'Whether genetic testing has been done on other family members: yes, no, or empty string.';
COMMENT ON COLUMN assessment_genetic_testing_history.family_member_testing_details IS
    'Details of genetic testing on family members.';
COMMENT ON COLUMN assessment_genetic_testing_history.consent_for_further_testing IS
    'Whether the patient consents to further genetic testing: yes, no, or empty string.';
