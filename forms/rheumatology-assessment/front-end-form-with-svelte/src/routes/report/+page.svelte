<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { das28Label, das28Color, bmiCategory, calculateAge, diseaseActivityLabel } from '$lib/engine/utils';
	import Badge from '$lib/components/ui/Badge.svelte';

	const data = $derived(assessment.data);
	const result = $derived(assessment.result);

	$effect(() => {
		if (!assessment.result) {
			goto('/');
		}
	});

	let pdfError = $state('');

	async function downloadPDF() {
		pdfError = '';
		try {
			const res = await fetch('/report/pdf', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ data: assessment.data, result: assessment.result })
			});
			if (res.ok) {
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `rheumatology-assessment-${data.demographics.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
				a.click();
				URL.revokeObjectURL(url);
			} else {
				pdfError = 'Failed to generate PDF. Please try again.';
			}
		} catch {
			pdfError = 'Failed to generate PDF. Please check your connection and try again.';
		}
	}

	function startNew() {
		assessment.reset();
		goto('/');
	}

	const priorityColor: Record<string, string> = {
		high: 'bg-red-100 text-red-800 border-red-300',
		medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		low: 'bg-gray-100 text-gray-700 border-gray-300'
	};

	function getAllMedications() {
		const meds = data.currentMedications;
		return [
			...meds.dmards.map((m) => ({ ...m, category: 'DMARD' })),
			...meds.biologics.map((m) => ({ ...m, category: 'Biologic' })),
			...meds.nsaids.map((m) => ({ ...m, category: 'NSAID' })),
			...meds.steroids.map((m) => ({ ...m, category: 'Steroid' })),
			...meds.painMedication.map((m) => ({ ...m, category: 'Pain' })),
			...meds.supplements.map((m) => ({ ...m, category: 'Supplement' }))
		];
	}
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">Assessment Report</h1>
				<div class="flex gap-3">
					{#if pdfError}
						<span class="text-sm text-red-600">{pdfError}</span>
					{/if}
					<button
						onclick={downloadPDF}
						class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
					>
						Download PDF
					</button>
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
			<!-- DAS28 Score Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {das28Color(result.das28Score)}">
				<div class="text-3xl font-bold">
					{#if result.das28Score !== null}
						DAS28: {result.das28Score.toFixed(2)}
					{:else}
						DAS28: Incomplete Data
					{/if}
				</div>
				<div class="mt-1 text-lg">{diseaseActivityLabel(result.diseaseActivity)}</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Additional Flags -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues for Rheumatologist</h2>
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
					<h2 class="mb-4 text-lg font-bold text-gray-900">Clinical Findings</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Rule</th>
								<th class="pb-2 pr-4">Category</th>
								<th class="pb-2">Finding</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.category}</td>
									<td class="py-2">{rule.description}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- Patient Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Patient Summary</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Name:</span>
						{data.demographics.firstName} {data.demographics.lastName}
					</div>
					<div>
						<span class="font-medium text-gray-600">DOB:</span>
						{data.demographics.dateOfBirth}
						{#if calculateAge(data.demographics.dateOfBirth)}
							(Age {calculateAge(data.demographics.dateOfBirth)})
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">Sex:</span>
						{data.demographics.sex}
					</div>
					<div>
						<span class="font-medium text-gray-600">BMI:</span>
						{data.demographics.bmi ?? 'N/A'}
						{#if data.demographics.bmi}
							({bmiCategory(data.demographics.bmi)})
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">Primary Diagnosis:</span>
						{data.diseaseHistory.primaryDiagnosis || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Disease Duration:</span>
						{data.diseaseHistory.diseaseDurationYears ?? 'N/A'} years
					</div>
				</div>
			</div>

			<!-- DAS28 Components -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">DAS28 Components</h2>
				<div class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
					<div class="rounded-lg bg-gray-50 p-3 text-center">
						<div class="text-xs text-gray-500">TJC28</div>
						<div class="text-xl font-bold">{data.jointAssessment.tenderJointCount28 ?? '-'}</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-3 text-center">
						<div class="text-xs text-gray-500">SJC28</div>
						<div class="text-xl font-bold">{data.jointAssessment.swollenJointCount28 ?? '-'}</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-3 text-center">
						<div class="text-xs text-gray-500">ESR (mm/hr)</div>
						<div class="text-xl font-bold">{data.laboratoryResults.esr ?? '-'}</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-3 text-center">
						<div class="text-xs text-gray-500">Patient VAS</div>
						<div class="text-xl font-bold">{data.jointAssessment.patientGlobalVAS ?? '-'}</div>
					</div>
				</div>
			</div>

			<!-- Medications -->
			{@const allMeds = getAllMedications()}
			{#if allMeds.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Medications</h2>
					<ul class="list-disc space-y-1 pl-5 text-sm">
						{#each allMeds as med}
							<li><span class="font-medium">[{med.category}]</span> {med.name} {med.dose} {med.frequency}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Allergies -->
			{#if data.allergies.drugAllergies.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Allergies</h2>
					<ul class="list-disc space-y-1 pl-5 text-sm">
						{#each data.allergies.drugAllergies as allergy}
							<li>
								<strong>{allergy.allergen}</strong> - {allergy.reaction}
								{#if allergy.severity}
									<span class="ml-1 rounded px-1.5 py-0.5 text-xs {allergy.severity === 'anaphylaxis' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">
										{allergy.severity}
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</main>
	</div>
{/if}
