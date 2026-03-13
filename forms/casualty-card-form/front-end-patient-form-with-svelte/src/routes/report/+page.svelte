<script lang="ts">
	import { goto } from '$app/navigation';
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import { news2ResponseLabel, news2ResponseColor, news2ScoreColor, calculateAge, mtsCategoryLabel } from '$lib/engine/utils';

	const data = $derived(casualtyCard.data);
	const result = $derived(casualtyCard.result);

	$effect(() => {
		if (!casualtyCard.result) {
			goto('/');
		}
	});

	function startNew() {
		casualtyCard.reset();
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
				<h1 class="text-lg font-bold text-gray-900">Casualty Card Report</h1>
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
						New Form
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-4xl px-4 py-6">
			<!-- NEWS2 Score Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {news2ScoreColor(result.news2.totalScore)}">
				<div class="text-3xl font-bold">NEWS2: {result.news2.totalScore}</div>
				<div class="mt-1 text-lg">{news2ResponseLabel(result.news2.clinicalResponse)}</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- NEWS2 Parameter Breakdown -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">NEWS2 Parameter Scores</h2>
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left text-gray-600">
							<th class="pb-2 pr-4">Parameter</th>
							<th class="pb-2 pr-4">Value</th>
							<th class="pb-2">Score</th>
						</tr>
					</thead>
					<tbody>
						{#each result.news2.parameterScores as ps (ps.parameter)}
							<tr class="border-b border-gray-100">
								<td class="py-2 pr-4">{ps.parameter}</td>
								<td class="py-2 pr-4">{ps.value}</td>
								<td class="py-2">
									<span class="rounded px-2 py-0.5 text-xs font-bold {ps.score >= 3 ? 'bg-red-100 text-red-800' : ps.score >= 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
										{ps.score}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Flagged Issues -->
			{#if result.flaggedIssues.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h2>
					<div class="space-y-2">
						{#each result.flaggedIssues as flag (flag.id)}
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
						<span class="font-medium text-gray-600">NHS Number:</span>
						{data.demographics.nhsNumber || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Triage -->
			{#if data.arrivalTriage.mtsCategory}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Triage</h2>
					<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
						<div>
							<span class="font-medium text-gray-600">MTS Category:</span>
							{mtsCategoryLabel(data.arrivalTriage.mtsCategory)}
						</div>
						<div>
							<span class="font-medium text-gray-600">Arrival Mode:</span>
							{data.arrivalTriage.arrivalMode}
						</div>
						{#if data.arrivalTriage.mtsFlowchart}
							<div>
								<span class="font-medium text-gray-600">MTS Flowchart:</span>
								{data.arrivalTriage.mtsFlowchart}
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Presenting Complaint -->
			{#if data.presentingComplaint.chiefComplaint}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Presenting Complaint</h2>
					<div class="text-sm">
						<p><span class="font-medium text-gray-600">Chief Complaint:</span> {data.presentingComplaint.chiefComplaint}</p>
						{#if data.presentingComplaint.historyOfPresentingComplaint}
							<p class="mt-2"><span class="font-medium text-gray-600">HPC:</span> {data.presentingComplaint.historyOfPresentingComplaint}</p>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Assessment & Plan -->
			{#if data.assessmentPlan.workingDiagnosis}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Assessment & Plan</h2>
					<div class="text-sm">
						<p><span class="font-medium text-gray-600">Working Diagnosis:</span> {data.assessmentPlan.workingDiagnosis}</p>
						{#if data.assessmentPlan.differentialDiagnoses}
							<p class="mt-2"><span class="font-medium text-gray-600">Differentials:</span> {data.assessmentPlan.differentialDiagnoses}</p>
						{/if}
						{#if data.assessmentPlan.clinicalImpression}
							<p class="mt-2"><span class="font-medium text-gray-600">Clinical Impression:</span> {data.assessmentPlan.clinicalImpression}</p>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Medications -->
			{#if data.medicalHistory.medications.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Medications</h2>
					<ul class="list-disc space-y-1 pl-5 text-sm">
						{#each data.medicalHistory.medications as med, i (i)}
							<li>{med.name} {med.dose} {med.frequency}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Allergies -->
			{#if data.medicalHistory.allergies.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Allergies</h2>
					<ul class="list-disc space-y-1 pl-5 text-sm">
						{#each data.medicalHistory.allergies as allergy, i (i)}
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

			<!-- Disposition -->
			{#if data.disposition.disposition}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Disposition</h2>
					<div class="text-sm">
						<p><span class="font-medium text-gray-600">Outcome:</span> {data.disposition.disposition}</p>
						{#if data.disposition.disposition === 'admitted'}
							<p class="mt-1"><span class="font-medium text-gray-600">Specialty:</span> {data.disposition.admittingSpecialty}</p>
							<p class="mt-1"><span class="font-medium text-gray-600">Ward:</span> {data.disposition.ward}</p>
						{:else if data.disposition.disposition === 'discharged'}
							<p class="mt-1"><span class="font-medium text-gray-600">Diagnosis:</span> {data.disposition.dischargeDiagnosis}</p>
							{#if data.disposition.followUp}
								<p class="mt-1"><span class="font-medium text-gray-600">Follow-up:</span> {data.disposition.followUp}</p>
							{/if}
						{:else if data.disposition.disposition === 'transferred'}
							<p class="mt-1"><span class="font-medium text-gray-600">Receiving Hospital:</span> {data.disposition.receivingHospital}</p>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Completed By -->
			{#if data.safeguardingConsent.completedByName}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Completed By</h2>
					<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
						<div>
							<span class="font-medium text-gray-600">Name:</span>
							{data.safeguardingConsent.completedByName}
						</div>
						<div>
							<span class="font-medium text-gray-600">Role:</span>
							{data.safeguardingConsent.completedByRole}
						</div>
						{#if data.safeguardingConsent.completedByGmcNumber}
							<div>
								<span class="font-medium text-gray-600">GMC:</span>
								{data.safeguardingConsent.completedByGmcNumber}
							</div>
						{/if}
						{#if data.safeguardingConsent.seniorReviewingClinician}
							<div>
								<span class="font-medium text-gray-600">Senior Reviewer:</span>
								{data.safeguardingConsent.seniorReviewingClinician}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</main>
	</div>
{/if}
