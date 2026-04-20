# Genetics Assessment

Clinical genetics assessment capturing proband medical history, detailed three-generation family pedigree, ancestry, and targeted risk scoring (e.g. Manchester Score for BRCA, Bethesda criteria for Lynch syndrome) to stratify genetic risk and guide testing and referral.

## Directory structure

- ./index.md - Project overview and documentation
- ./AGENTS.md - Agent instructions (this file, referenced by CLAUDE.md)
- ./plan.md - Development roadmap
- ./tasks.md - Task tracking
- ./front-end-patient-form-with-svelte/ - Clinician form; SvelteKit + Svelte 5 + Tailwind 4
- ./front-end-clinician-dashboard-with-svelte/ - Genetics clinic dashboard; SvelteKit + SVAR DataGrid

## Scoring system

- **Instrument**: Clinical Genetics Risk Assessment (aligned to NICE CG164 / NCCN / Manchester Score)
- **Range**: Low / Moderate / High genetic risk
- **Scoring elements**: Manchester Score for BRCA, Bethesda criteria for Lynch syndrome, Tyrer-Cuzick for breast cancer, PREMM5 for Lynch
- **Engine files**: `types.ts`, `genetics-grader.ts`, `rules.ts`, `flagged-issues.ts`, `utils.ts`
- **Test file**: `genetics-grader.test.ts`

## Assessment steps (9 total)

1. Proband Demographics - `Step1ProbandDemographics.svelte`
2. Presenting Concern - `Step2PresentingConcern.svelte`
3. Personal Medical History - `Step3PersonalMedicalHistory.svelte`
4. Three-Generation Family Pedigree - `Step4FamilyPedigree.svelte`
5. Consanguinity & Ancestry - `Step5ConsanguinityAncestry.svelte`
6. Targeted Risk Scoring - `Step6TargetedRiskScoring.svelte`
7. Prior Genetic Testing - `Step7PriorGeneticTesting.svelte`
8. Patient Understanding & Concerns - `Step8PatientUnderstandingConcerns.svelte`
9. Recommendation & Referral Plan - `Step9RecommendationReferralPlan.svelte`

## Patient form architecture

- SvelteKit 2.x with Svelte 5 runes ($state, $derived, $bindable, $props, $effect)
- Tailwind CSS 4 with @import 'tailwindcss' and @theme for custom colours
- Multi-step wizard with StepNavigation and ProgressBar components
- Pure scoring engine with no side effects
- Class-based reactive store (assessment.svelte.ts)
- PDF report generation via /report/pdf server endpoint
- Vitest unit tests for grading logic

## Clinician dashboard

- SVAR DataGrid (@svar-ui/svelte-grid) with Willow theme
- Sortable columns and dropdown filters
- Backend API client with sample data fallback

## Conventions

- Empty string '' for unanswered text fields
- null for unanswered numeric fields
- camelCase property names in TypeScript
- Step components named StepNName.svelte (1-indexed)
- UI components in src/lib/components/ui/

## Compliance

- MDCG 2019-11 Rev.1 (EU MDR Software Classification)
- UK Medical Devices Regulations 2002
- ISO/IEC/IEEE 26514:2022
