<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { controlLevelLabel, controlLevelColor } from '$lib/engine/utils';

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
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">Assessment Report</h1>
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
			<!-- Control Score Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {controlLevelColor(result.controlLevel)}">
				<div class="text-3xl font-bold">{result.controlScore}%</div>
				<div class="mt-1 text-lg">Composite Control Score</div>
				<div class="mt-1 text-lg font-semibold">{controlLevelLabel(result.controlLevel)}</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Patient Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Patient Summary</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Patient:</span>
						{data.patientInformation.fullName || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Date of Birth:</span>
						{data.patientInformation.dateOfBirth || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Diabetes Type:</span>
						{data.diabetesHistory.diabetesType || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Duration:</span>
						{data.diabetesHistory.yearsDuration ?? 'N/A'} years
					</div>
				</div>
			</div>

			<!-- Glycaemic Control Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Glycaemic Control</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">HbA1c:</span>
						{#if data.glycaemicControl.hba1cValue !== null}
							{data.glycaemicControl.hba1cValue}
							{data.glycaemicControl.hba1cUnit === 'mmolMol' ? 'mmol/mol' : data.glycaemicControl.hba1cUnit === 'percent' ? '%' : ''}
						{:else}
							Not recorded
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">Target:</span>
						{data.glycaemicControl.hba1cTarget ?? 'Not set'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Time in Range:</span>
						{data.glycaemicControl.timeInRange ?? 'N/A'}%
					</div>
					<div>
						<span class="font-medium text-gray-600">Monitoring:</span>
						{data.glycaemicControl.glucoseMonitoringType || 'Not specified'}
					</div>
				</div>
			</div>

			<!-- Additional Flags -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Clinical Flags</h2>
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
					<h2 class="mb-4 text-lg font-bold text-gray-900">Control Analysis</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Rule</th>
								<th class="pb-2 pr-4">Category</th>
								<th class="pb-2 pr-4">Description</th>
								<th class="pb-2">Concern</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.category}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2">
										<span class="rounded px-2 py-0.5 text-xs font-bold uppercase {priorityColor[rule.concernLevel] ?? 'bg-gray-100 text-gray-700'}">
											{rule.concernLevel}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- Care Plan -->
			{#if data.reviewCarePlan.clinicalNotes || data.reviewCarePlan.referrals}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Care Plan</h2>
					{#if data.reviewCarePlan.clinicalNotes}
						<div class="mb-3">
							<span class="font-medium text-gray-600">Clinical Notes:</span>
							<p class="mt-1 text-sm">{data.reviewCarePlan.clinicalNotes}</p>
						</div>
					{/if}
					{#if data.reviewCarePlan.referrals}
						<div class="mb-3">
							<span class="font-medium text-gray-600">Referrals:</span>
							<p class="mt-1 text-sm">{data.reviewCarePlan.referrals}</p>
						</div>
					{/if}
					{#if data.reviewCarePlan.nextReviewDate}
						<div>
							<span class="font-medium text-gray-600">Next Review:</span>
							{data.reviewCarePlan.nextReviewDate}
						</div>
					{/if}
				</div>
			{/if}
		</main>
	</div>
{/if}
