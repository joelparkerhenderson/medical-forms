<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import {
		vaccinationLevelLabel,
		vaccinationLevelColor,
		formatDate,
		formatNhsNumber,
		childhoodScore,
		adultScore,
		consentScore
	} from '$lib/engine/utils';

	const data = $derived(assessment.data);
	const result = $derived(assessment.result);

	$effect(() => {
		if (!assessment.result) {
			goto('/');
		}
	});

	function startNew() {
		assessment.reset();
		goto('/');
	}

	const priorityColor: Record<string, string> = {
		high: 'bg-red-100 text-red-800 border-red-300',
		medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		low: 'bg-green-100 text-green-700 border-green-300'
	};

	const concernColor: Record<string, string> = {
		high: 'bg-red-100 text-red-800',
		medium: 'bg-yellow-100 text-yellow-800',
		low: 'bg-green-100 text-green-700'
	};

	function vaccineLabel(val: number | null): string {
		if (val === null) return 'N/A';
		if (val === 0) return 'Not Given';
		if (val === 1) return 'Partial';
		if (val === 2) return 'Complete';
		return String(val);
	}

	function yesNoLabel(val: string): string {
		if (val === 'yes') return 'Yes';
		if (val === 'no') return 'No';
		if (val === 'notApplicable') return 'N/A';
		if (val === 'unknown') return 'Unknown';
		return val || 'N/A';
	}

	function likertLabel(val: number | null): string {
		if (val === null) return 'N/A';
		return String(val) + ' / 5';
	}

	function scoreDisplay(val: number | null): string {
		if (val === null) return 'N/A';
		return val + '%';
	}
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">Vaccination Compliance Report</h1>
				<div class="flex gap-3">
					<button
						onclick={() => window.print()}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Print
					</button>
					<button
						onclick={startNew}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						New Assessment
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-4xl px-4 py-6">
			<!-- Vaccination Level Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {vaccinationLevelColor(result.vaccinationLevel)}">
				<div class="text-3xl font-bold">{result.vaccinationScore}%</div>
				<div class="mt-1 text-lg">{vaccinationLevelLabel(result.vaccinationLevel)}</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Dimension Scores -->
			<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="rounded-xl border border-gray-200 bg-white p-4 text-center">
					<div class="text-2xl font-bold text-gray-900">{scoreDisplay(childhoodScore(data))}</div>
					<div class="mt-1 text-sm text-gray-600">Childhood Vaccinations</div>
				</div>
				<div class="rounded-xl border border-gray-200 bg-white p-4 text-center">
					<div class="text-2xl font-bold text-gray-900">{scoreDisplay(adultScore(data))}</div>
					<div class="mt-1 text-sm text-gray-600">Adult Vaccinations</div>
				</div>
				<div class="rounded-xl border border-gray-200 bg-white p-4 text-center">
					<div class="text-2xl font-bold text-gray-900">{scoreDisplay(consentScore(data))}</div>
					<div class="mt-1 text-sm text-gray-600">Consent Quality</div>
				</div>
			</div>

			<!-- Additional Flags -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues for Review</h2>
					<div class="space-y-2">
						{#each result.additionalFlags as flag}
							<div class="flex items-start gap-3 rounded-lg border p-3 {priorityColor[flag.priority]}">
								<span class="mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase {priorityColor[flag.priority]}">
									{flag.priority}
								</span>
								<div>
									<span class="font-medium">{flag.category}:</span>
									{flag.message}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Fired Rules -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Vaccination Concerns ({result.firedRules.length})</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Rule</th>
								<th class="pb-2 pr-4">Category</th>
								<th class="pb-2 pr-4">Concern</th>
								<th class="pb-2 pr-4">Description</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.category}</td>
									<td class="py-2 pr-4">
										<span class="rounded px-2 py-0.5 text-xs font-bold {concernColor[rule.concernLevel]}">
											{rule.concernLevel}
										</span>
									</td>
									<td class="py-2 pr-4">{rule.description}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- Patient Details -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Patient Details</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">Name:</span> {data.patientInformation.patientName || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">DOB:</span> {formatDate(data.patientInformation.dateOfBirth)}</div>
					<div><span class="font-medium text-gray-600">Sex:</span> {data.patientInformation.patientSex || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Age:</span> {data.patientInformation.patientAge || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">NHS Number:</span> {formatNhsNumber(data.patientInformation.nhsNumber)}</div>
					<div><span class="font-medium text-gray-600">GP Practice:</span> {data.patientInformation.gpPractice || 'N/A'}</div>
				</div>
			</div>

			<!-- Immunization History -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Immunization History</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">Record Available:</span> {yesNoLabel(data.immunizationHistory.hasVaccinationRecord)}</div>
					<div><span class="font-medium text-gray-600">Record Source:</span> {data.immunizationHistory.recordSource || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Last Review:</span> {formatDate(data.immunizationHistory.lastReviewDate)}</div>
					<div><span class="font-medium text-gray-600">Adverse Reactions:</span> {yesNoLabel(data.immunizationHistory.previousAdverseReactions)}</div>
					<div><span class="font-medium text-gray-600">Immunocompromised:</span> {yesNoLabel(data.immunizationHistory.immunocompromised)}</div>
				</div>
			</div>

			<!-- Childhood Vaccinations -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Childhood Vaccinations</h2>
				<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">DTaP/IPV/Hib/HepB:</span> {vaccineLabel(data.childhoodVaccinations.dtapIpvHibHepb)}</div>
					<div><span class="font-medium text-gray-600">Pneumococcal:</span> {vaccineLabel(data.childhoodVaccinations.pneumococcal)}</div>
					<div><span class="font-medium text-gray-600">Rotavirus:</span> {vaccineLabel(data.childhoodVaccinations.rotavirus)}</div>
					<div><span class="font-medium text-gray-600">Meningitis B:</span> {vaccineLabel(data.childhoodVaccinations.meningitisB)}</div>
					<div><span class="font-medium text-gray-600">MMR:</span> {vaccineLabel(data.childhoodVaccinations.mmr)}</div>
					<div><span class="font-medium text-gray-600">Hib/MenC:</span> {vaccineLabel(data.childhoodVaccinations.hibMenc)}</div>
					<div><span class="font-medium text-gray-600">Pre-school Booster:</span> {vaccineLabel(data.childhoodVaccinations.preschoolBooster)}</div>
				</div>
			</div>

			<!-- Adult Vaccinations -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Adult Vaccinations</h2>
				<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">Td/IPV Booster:</span> {vaccineLabel(data.adultVaccinations.tdIpvBooster)}</div>
					<div><span class="font-medium text-gray-600">HPV:</span> {vaccineLabel(data.adultVaccinations.hpv)}</div>
					<div><span class="font-medium text-gray-600">Meningitis ACWY:</span> {vaccineLabel(data.adultVaccinations.meningitisAcwy)}</div>
					<div><span class="font-medium text-gray-600">Influenza:</span> {vaccineLabel(data.adultVaccinations.influenzaAnnual)}</div>
					<div><span class="font-medium text-gray-600">COVID-19:</span> {vaccineLabel(data.adultVaccinations.covid19)}</div>
					<div><span class="font-medium text-gray-600">Shingles:</span> {vaccineLabel(data.adultVaccinations.shingles)}</div>
					<div><span class="font-medium text-gray-600">Pneumococcal PPV23:</span> {vaccineLabel(data.adultVaccinations.pneumococcalPpv)}</div>
				</div>
			</div>

			<!-- Contraindications & Allergies -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Contraindications & Allergies</h2>
				<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">Egg Allergy:</span> {yesNoLabel(data.contraindicationsAllergies.eggAllergy)}</div>
					<div><span class="font-medium text-gray-600">Gelatin Allergy:</span> {yesNoLabel(data.contraindicationsAllergies.gelatinAllergy)}</div>
					<div><span class="font-medium text-gray-600">Latex Allergy:</span> {yesNoLabel(data.contraindicationsAllergies.latexAllergy)}</div>
					<div><span class="font-medium text-gray-600">Neomycin Allergy:</span> {yesNoLabel(data.contraindicationsAllergies.neomycinAllergy)}</div>
					<div><span class="font-medium text-gray-600">Pregnant:</span> {yesNoLabel(data.contraindicationsAllergies.pregnant)}</div>
					<div><span class="font-medium text-gray-600">Severe Illness:</span> {yesNoLabel(data.contraindicationsAllergies.severeIllness)}</div>
					<div><span class="font-medium text-gray-600">Previous Anaphylaxis:</span> {yesNoLabel(data.contraindicationsAllergies.previousAnaphylaxis)}</div>
				</div>
			</div>

			<!-- Consent & Administration -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Consent & Administration</h2>
				<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">Consent Given:</span> {yesNoLabel(data.consentInformation.consentGiven)}</div>
					<div><span class="font-medium text-gray-600">Consent Date:</span> {formatDate(data.consentInformation.consentDate)}</div>
					<div><span class="font-medium text-gray-600">Vaccine Name:</span> {data.administrationRecord.vaccineName || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Batch Number:</span> {data.administrationRecord.batchNumber || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Administered By:</span> {data.administrationRecord.administeredBy || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Administration Date:</span> {formatDate(data.administrationRecord.administrationDate)}</div>
				</div>
			</div>

			<!-- Clinical Review -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Clinical Review</h2>
				<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">Post-vaccination Observation:</span> {likertLabel(data.clinicalReview.postVaccinationObservation)}</div>
					<div><span class="font-medium text-gray-600">Immediate Reaction:</span> {yesNoLabel(data.clinicalReview.immediateReaction)}</div>
					<div><span class="font-medium text-gray-600">Catch-up Schedule:</span> {yesNoLabel(data.clinicalReview.catchUpScheduleNeeded)}</div>
					<div><span class="font-medium text-gray-600">Referral Needed:</span> {yesNoLabel(data.clinicalReview.referralNeeded)}</div>
					<div><span class="font-medium text-gray-600">Next Dose Due:</span> {formatDate(data.clinicalReview.nextDoseDue)}</div>
					<div><span class="font-medium text-gray-600">Reviewing Clinician:</span> {data.clinicalReview.reviewingClinician || 'N/A'}</div>
				</div>
				{#if data.clinicalReview.clinicianNotes}
					<div class="mt-3 text-sm">
						<span class="font-medium text-gray-600">Clinician Notes:</span>
						<p class="mt-1 whitespace-pre-wrap text-gray-700">{data.clinicalReview.clinicianNotes}</p>
					</div>
				{/if}
			</div>
		</main>
	</div>
{/if}
