<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { riskCategoryLabel, riskCategoryColor } from '$lib/engine/utils';

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

	const riskLevelColor: Record<string, string> = {
		high: 'bg-red-100 text-red-800',
		medium: 'bg-yellow-100 text-yellow-800',
		low: 'bg-green-100 text-green-800'
	};
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">Heart Health Check Report</h1>
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
			<!-- Risk Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {riskCategoryColor(result.riskCategory)}">
				<div class="text-3xl font-bold">{riskCategoryLabel(result.riskCategory)}</div>
				<div class="mt-2 text-lg">10-Year CVD Risk: {result.tenYearRiskPercent}%</div>
				{#if result.heartAge != null}
					<div class="mt-1 text-lg">Heart Age: {result.heartAge} years</div>
				{/if}
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Heart Age Comparison -->
			{#if result.heartAge != null && data.demographicsEthnicity.age != null}
				{@const ageDiff = result.heartAge - data.demographicsEthnicity.age}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Heart Age vs Chronological Age</h2>
					<div class="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
						<div>
							<div class="text-sm text-gray-600">Chronological Age</div>
							<div class="text-2xl font-bold text-gray-900">{data.demographicsEthnicity.age}</div>
						</div>
						<div>
							<div class="text-sm text-gray-600">Heart Age</div>
							<div class="text-2xl font-bold {ageDiff > 5 ? 'text-red-600' : ageDiff < 0 ? 'text-green-600' : 'text-gray-900'}">{result.heartAge}</div>
						</div>
						<div>
							<div class="text-sm text-gray-600">Difference</div>
							<div class="text-2xl font-bold {ageDiff > 5 ? 'text-red-600' : ageDiff < 0 ? 'text-green-600' : 'text-gray-900'}">
								{ageDiff > 0 ? '+' : ''}{ageDiff} years
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Fired Rules -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Risk Factors Identified</h2>
					<div class="space-y-2">
						{#each result.firedRules as rule (rule.id)}
							<div class="flex items-start gap-3 rounded-lg border border-gray-100 p-3">
								<span class="mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase {riskLevelColor[rule.riskLevel] ?? 'bg-gray-100 text-gray-800'}">
									{rule.riskLevel}
								</span>
								<div>
									<span class="font-medium text-gray-900">{rule.category}:</span>
									<span class="text-gray-700"> {rule.description}</span>
									<span class="ml-1 text-xs text-gray-400">[{rule.id}]</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Flagged Issues -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h2>
					<div class="space-y-2">
						{#each result.additionalFlags as flag (flag.id)}
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

			<!-- Patient Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Patient Summary</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Name:</span>
						{data.patientInformation.fullName || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">DOB:</span>
						{data.patientInformation.dateOfBirth || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Sex:</span>
						{data.demographicsEthnicity.sex || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Age:</span>
						{data.demographicsEthnicity.age ?? 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">NHS Number:</span>
						{data.patientInformation.nhsNumber || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">GP:</span>
						{data.patientInformation.gpName || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Key Risk Factors -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Key Risk Factors</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					{#if data.bloodPressure.systolicBP != null}
						<div>
							<span class="font-medium text-gray-600">Blood Pressure:</span>
							{data.bloodPressure.systolicBP}/{data.bloodPressure.diastolicBP ?? '?'} mmHg
						</div>
					{/if}
					{#if data.cholesterol.totalCholesterol != null}
						<div>
							<span class="font-medium text-gray-600">Total Cholesterol:</span>
							{data.cholesterol.totalCholesterol} mmol/L
						</div>
					{/if}
					<div>
						<span class="font-medium text-gray-600">Smoking:</span>
						{data.smokingAlcohol.smokingStatus || 'Not stated'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Diabetes:</span>
						{data.medicalConditions.hasDiabetes || 'Not stated'}
					</div>
					{#if data.bodyMeasurements.bmi != null || (data.bodyMeasurements.heightCm != null && data.bodyMeasurements.weightKg != null)}
						<div>
							<span class="font-medium text-gray-600">BMI:</span>
							{data.bodyMeasurements.bmi ?? 'auto-calculated'}
						</div>
					{/if}
					<div>
						<span class="font-medium text-gray-600">Family CVD &lt;60:</span>
						{data.familyHistory.familyCVDUnder60 || 'Not stated'}
					</div>
				</div>
			</div>

			<!-- Clinician Details -->
			{#if data.reviewCalculate.clinicianName}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Clinician</h2>
					<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
						<div>
							<span class="font-medium text-gray-600">Name:</span>
							{data.reviewCalculate.clinicianName}
						</div>
						{#if data.reviewCalculate.reviewDate}
							<div>
								<span class="font-medium text-gray-600">Review Date:</span>
								{data.reviewCalculate.reviewDate}
							</div>
						{/if}
					</div>
					{#if data.reviewCalculate.clinicalNotes}
						<div class="mt-3 text-sm">
							<span class="font-medium text-gray-600">Notes:</span>
							<p class="mt-1 text-gray-700">{data.reviewCalculate.clinicalNotes}</p>
						</div>
					{/if}
				</div>
			{/if}
		</main>
	</div>
{/if}
