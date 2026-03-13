<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { abnormalityLevelLabel, abnormalityLevelColor } from '$lib/engine/utils';

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

	const concernColor: Record<string, string> = {
		high: 'bg-red-100 text-red-800',
		medium: 'bg-yellow-100 text-yellow-800',
		low: 'bg-green-100 text-green-800'
	};
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">Hematology Assessment Report</h1>
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
			<!-- Score Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {abnormalityLevelColor(result.abnormalityLevel)}">
				<div class="text-3xl font-bold">{result.abnormalityScore}%</div>
				<div class="mt-1 text-lg">{abnormalityLevelLabel(result.abnormalityLevel)}</div>
				<div class="mt-2 text-sm opacity-75">
					Composite Abnormality Score |
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Patient Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Patient Summary</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Patient:</span>
						{data.patientInformation.patientName || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">DOB:</span>
						{data.patientInformation.dateOfBirth || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">MRN:</span>
						{data.patientInformation.medicalRecordNumber || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Specimen Date:</span>
						{data.patientInformation.specimenDate || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Referring Physician:</span>
						{data.patientInformation.referringPhysician || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Clinical Indication:</span>
						{data.patientInformation.clinicalIndication || 'Not provided'}
					</div>
				</div>
			</div>

			<!-- Additional Flags -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h2>
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
					<h2 class="mb-4 text-lg font-bold text-gray-900">Hematology Analysis</h2>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b border-gray-200">
									<th class="py-2 pr-4 text-left font-semibold text-gray-700">Rule</th>
									<th class="py-2 pr-4 text-left font-semibold text-gray-700">Category</th>
									<th class="py-2 pr-4 text-left font-semibold text-gray-700">Description</th>
									<th class="py-2 text-left font-semibold text-gray-700">Concern</th>
								</tr>
							</thead>
							<tbody>
								{#each result.firedRules as rule}
									<tr class="border-b border-gray-100">
										<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
										<td class="py-2 pr-4">{rule.category}</td>
										<td class="py-2 pr-4">{rule.description}</td>
										<td class="py-2">
											<span class="rounded px-2 py-0.5 text-xs font-bold uppercase {concernColor[rule.concernLevel] ?? 'bg-gray-100 text-gray-700'}">
												{rule.concernLevel}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Diagnosis & Clinical Review -->
			{#if data.clinicalReview.diagnosis || data.clinicalReview.clinicalSummary || data.clinicalReview.followUpPlan}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Clinical Review</h2>
					{#if data.clinicalReview.diagnosis}
						<div class="mb-3">
							<span class="font-medium text-gray-600">Diagnosis:</span>
							<p class="mt-1 text-sm text-gray-700">{data.clinicalReview.diagnosis}</p>
						</div>
					{/if}
					{#if data.clinicalReview.clinicalSummary}
						<div class="mb-3">
							<span class="font-medium text-gray-600">Clinical Summary:</span>
							<p class="mt-1 text-sm text-gray-700">{data.clinicalReview.clinicalSummary}</p>
						</div>
					{/if}
					{#if data.clinicalReview.followUpPlan}
						<div class="mb-3">
							<span class="font-medium text-gray-600">Follow-up Plan:</span>
							<p class="mt-1 text-sm text-gray-700">{data.clinicalReview.followUpPlan}</p>
						</div>
					{/if}
					{#if data.clinicalReview.additionalNotes}
						<div>
							<span class="font-medium text-gray-600">Additional Notes:</span>
							<p class="mt-1 text-sm text-gray-700">{data.clinicalReview.additionalNotes}</p>
						</div>
					{/if}
				</div>
			{/if}
		</main>
	</div>
{/if}
