<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { mcasScoreLabel, mcasScoreColor, calculateAge } from '$lib/engine/utils';

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
				a.download = `mcas-assessment-${data.demographics.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
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
			<!-- MCAS Score Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {mcasScoreColor(result.symptomScore)}">
				<div class="text-3xl font-bold">MCAS Symptom Score {result.symptomScore}/40</div>
				<div class="mt-1 text-lg">{result.mcasCategory}</div>
				<div class="mt-1 text-sm">{result.organSystemsAffected} organ system(s) affected</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Additional Flags -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues for Clinician</h2>
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

			<!-- Symptom Score Breakdown -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Symptom Score Breakdown</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">ID</th>
								<th class="pb-2 pr-4">Organ System</th>
								<th class="pb-2 pr-4">Symptom</th>
								<th class="pb-2">Score</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.domain}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2 font-bold">{rule.score}/3</td>
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
						<span class="font-medium text-gray-600">Symptom Duration:</span>
						{data.symptomOverview.symptomDuration || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Symptom Frequency:</span>
						{data.symptomOverview.symptomFrequency || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Quality of Life Impact:</span>
						{data.symptomOverview.qualityOfLife || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Triggers -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Triggers & Patterns</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					{#if data.triggersPatterns.foodTriggers}
						<div class="sm:col-span-2">
							<span class="font-medium text-gray-600">Food Triggers:</span>
							{data.triggersPatterns.foodTriggers}
						</div>
					{/if}
					{#if data.triggersPatterns.environmentalTriggers}
						<div class="sm:col-span-2">
							<span class="font-medium text-gray-600">Environmental Triggers:</span>
							{data.triggersPatterns.environmentalTriggers}
						</div>
					{/if}
					<div>
						<span class="font-medium text-gray-600">Stress Trigger:</span>
						{data.triggersPatterns.stressTriggers || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Exercise Trigger:</span>
						{data.triggersPatterns.exerciseTrigger || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Temperature Trigger:</span>
						{data.triggersPatterns.temperatureTrigger || 'N/A'}
					</div>
					{#if data.triggersPatterns.medicationTriggers}
						<div class="sm:col-span-2">
							<span class="font-medium text-gray-600">Medication Triggers:</span>
							{data.triggersPatterns.medicationTriggers}
						</div>
					{/if}
				</div>
			</div>

			<!-- Laboratory Results -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Laboratory Results</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Serum Tryptase:</span>
						{data.laboratoryResults.serumTryptase !== null ? `${data.laboratoryResults.serumTryptase} ng/mL` : 'Not tested'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Plasma Histamine:</span>
						{data.laboratoryResults.histamine !== null ? `${data.laboratoryResults.histamine} ng/mL` : 'Not tested'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Prostaglandin D2:</span>
						{data.laboratoryResults.prostaglandinD2 !== null ? `${data.laboratoryResults.prostaglandinD2} ng/mL` : 'Not tested'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Chromogranin A:</span>
						{data.laboratoryResults.chromograninA !== null ? `${data.laboratoryResults.chromograninA} ng/mL` : 'Not tested'}
					</div>
				</div>
			</div>

			<!-- Current Treatment -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Current Treatment</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Antihistamines:</span>
						{data.currentTreatment.antihistamines || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Mast Cell Stabilizers:</span>
						{data.currentTreatment.mastCellStabilizers || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Leukotriene Inhibitors:</span>
						{data.currentTreatment.leukotrienInhibitors || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Epinephrine Auto-Injector:</span>
						{data.currentTreatment.epinephrine || 'N/A'}
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
