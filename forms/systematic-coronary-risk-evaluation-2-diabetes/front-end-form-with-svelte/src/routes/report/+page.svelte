<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte.js';
	import { riskCategoryLabel, riskCategoryBgColor } from '$lib/engine/utils.js';

	// If no result, redirect to start
	$effect(() => {
		if (!assessment.result) {
			goto('/');
		}
	});

	function startNew() {
		assessment.reset();
		goto('/');
	}

	let result = $derived(assessment.result);
	let data = $derived(assessment.data);
</script>

<svelte:head>
	<title>Assessment Report | SCORE2-Diabetes</title>
</svelte:head>

{#if result}
	<div class="mb-8 text-center">
		<h2 class="mb-2 text-2xl font-bold text-gray-800">SCORE2-Diabetes Risk Assessment Report</h2>
		<span class={`inline-block rounded-full px-4 py-2 text-sm font-bold ${riskCategoryBgColor(result.riskCategory)}`}>
			{riskCategoryLabel(result.riskCategory)}
		</span>
		<p class="mt-2 text-sm text-gray-500">Generated: {new Date(result.timestamp).toLocaleString()}</p>
	</div>

	<!-- Patient Summary -->
	<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold text-gray-800">Patient Summary</h3>
		<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
			<div>
				<p><strong>Name:</strong> {data.patientDemographics.fullName}</p>
				<p><strong>Date of Birth:</strong> {data.patientDemographics.dateOfBirth}</p>
				<p><strong>Sex:</strong> {data.patientDemographics.sex}</p>
				<p><strong>NHS Number:</strong> {data.patientDemographics.nhsNumber}</p>
			</div>
			<div>
				<p><strong>Diabetes Type:</strong> {data.diabetesHistory.diabetesType}</p>
				<p><strong>HbA1c:</strong> {data.diabetesHistory.hba1cValue ?? 'N/A'} {data.diabetesHistory.hba1cUnit}</p>
				<p><strong>BP:</strong> {data.bloodPressure.systolicBp ?? 'N/A'}/{data.bloodPressure.diastolicBp ?? 'N/A'} mmHg</p>
				<p><strong>eGFR:</strong> {data.renalFunction.egfr ?? 'N/A'} mL/min/1.73m2</p>
			</div>
			<div>
				<p><strong>BMI:</strong> {data.lifestyleFactors.bmi ?? 'N/A'} kg/m2</p>
				<p><strong>Total Cholesterol:</strong> {data.lipidProfile.totalCholesterol ?? 'N/A'} mmol/L</p>
				<p><strong>LDL Cholesterol:</strong> {data.lipidProfile.ldlCholesterol ?? 'N/A'} mmol/L</p>
				<p><strong>Smoking:</strong> {data.lifestyleFactors.smokingStatus || 'N/A'}</p>
			</div>
		</div>
	</div>

	<!-- Clinical Safety Flags -->
	{#if result.additionalFlags.length > 0}
		<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold text-gray-800">
				Clinical Safety Flags ({result.additionalFlags.length})
			</h3>
			<div class="space-y-3">
				{#each result.additionalFlags as flag}
					<div
						class="rounded-md border-l-4 p-3 text-sm {flag.priority === 'high'
							? 'border-red-500 bg-red-50'
							: flag.priority === 'medium'
								? 'border-yellow-500 bg-yellow-50'
								: 'border-blue-500 bg-blue-50'}"
					>
						<span class="font-semibold">{flag.category}:</span>
						{flag.message}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Fired Rules -->
	{#if result.firedRules.length > 0}
		<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold text-gray-800">
				Risk Classification Rules Triggered ({result.firedRules.length})
			</h3>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-gray-200 text-xs uppercase text-gray-500">
						<tr>
							<th class="px-3 py-2">Rule ID</th>
							<th class="px-3 py-2">Category</th>
							<th class="px-3 py-2">Description</th>
							<th class="px-3 py-2">Risk Level</th>
						</tr>
					</thead>
					<tbody>
						{#each result.firedRules as rule}
							<tr class="border-b border-gray-100">
								<td class="px-3 py-2 font-mono text-xs">{rule.id}</td>
								<td class="px-3 py-2">{rule.category}</td>
								<td class="px-3 py-2">{rule.description}</td>
								<td class="px-3 py-2">
									<span
										class="rounded-full px-2 py-0.5 text-xs font-semibold {rule.riskLevel === 'high'
											? 'bg-red-100 text-red-800'
											: rule.riskLevel === 'medium'
												? 'bg-yellow-100 text-yellow-800'
												: 'bg-blue-100 text-blue-800'}"
									>
										{rule.riskLevel}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- Actions -->
	<div class="text-center">
		<button
			onclick={startNew}
			class="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
		>
			New Assessment
		</button>
		<button
			onclick={() => window.print()}
			class="ml-4 rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
		>
			Print Report
		</button>
	</div>
{/if}
