<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { riskLevelLabel, riskLevelColor } from '$lib/engine/utils';

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
		low: 'bg-gray-100 text-gray-700 border-gray-300'
	};
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">Framingham Risk Score Report</h1>
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
			<!-- Risk Score Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {riskLevelColor(result.riskCategory)}">
				<div class="text-4xl font-bold">{result.tenYearRiskPercent}%</div>
				<div class="mt-1 text-lg">10-Year Risk of Hard Coronary Heart Disease</div>
				<div class="mt-2 text-base font-semibold">{riskLevelLabel(result.riskCategory)}</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Key Inputs -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Key Inputs</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">Patient:</span> {data.patientInformation.fullName || 'Not provided'}</div>
					<div><span class="font-medium text-gray-600">Age:</span> {data.demographics.age ?? 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Sex:</span> {data.demographics.sex || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Smoking:</span> {data.smokingHistory.smokingStatus || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Total Cholesterol:</span> {data.cholesterol.totalCholesterol ?? 'N/A'} {data.cholesterol.cholesterolUnit === 'mmolL' ? 'mmol/L' : 'mg/dL'}</div>
					<div><span class="font-medium text-gray-600">HDL Cholesterol:</span> {data.cholesterol.hdlCholesterol ?? 'N/A'} {data.cholesterol.cholesterolUnit === 'mmolL' ? 'mmol/L' : 'mg/dL'}</div>
					<div><span class="font-medium text-gray-600">Systolic BP:</span> {data.bloodPressure.systolicBp ?? 'N/A'} mmHg</div>
					<div><span class="font-medium text-gray-600">BP Treatment:</span> {data.bloodPressure.onBpTreatment || 'N/A'}</div>
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

			<!-- Risk Rules -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Risk Analysis</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Rule</th>
								<th class="pb-2 pr-4">Category</th>
								<th class="pb-2 pr-4">Description</th>
								<th class="pb-2">Level</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.category}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2">
										<span class="rounded px-2 py-0.5 text-xs font-bold uppercase {priorityColor[rule.riskLevel] ?? 'bg-gray-100 text-gray-700'}">
											{rule.riskLevel}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- Clinical Notes -->
			{#if data.reviewCalculate.clinicalNotes}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Clinical Notes</h2>
					<div class="text-sm">
						<span class="font-medium text-gray-600">Clinician:</span> {data.reviewCalculate.clinicianName || 'Not provided'}
					</div>
					<div class="mt-1 text-sm">
						<span class="font-medium text-gray-600">Review Date:</span> {data.reviewCalculate.reviewDate || 'Not provided'}
					</div>
					<p class="mt-3 text-sm">{data.reviewCalculate.clinicalNotes}</p>
				</div>
			{/if}
		</main>
	</div>
{/if}
