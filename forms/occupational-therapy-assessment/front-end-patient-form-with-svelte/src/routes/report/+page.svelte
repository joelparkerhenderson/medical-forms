<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { copmScoreLabel, copmScoreColor, calculateAge, difficultyLabel, difficultyColor } from '$lib/engine/utils';

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
				a.download = `occupational-therapy-assessment-${data.demographics.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
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
			<!-- COPM Score Banners -->
			<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="rounded-xl border-2 p-6 text-center {copmScoreColor(result.performanceScore)}">
					<div class="text-3xl font-bold">Performance {result.performanceScore}/10</div>
					<div class="mt-1 text-lg">{result.performanceCategory}</div>
				</div>
				<div class="rounded-xl border-2 p-6 text-center {copmScoreColor(result.satisfactionScore)}">
					<div class="text-3xl font-bold">Satisfaction {result.satisfactionScore}/10</div>
					<div class="mt-1 text-lg">{result.satisfactionCategory}</div>
				</div>
			</div>
			<div class="mb-6 text-center text-sm text-gray-500">
				Generated {new Date(result.timestamp).toLocaleString()}
			</div>

			<!-- Additional Flags -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues for Occupational Therapist</h2>
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

			<!-- COPM Breakdown -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">COPM Score Breakdown</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">ID</th>
								<th class="pb-2 pr-4">Domain</th>
								<th class="pb-2 pr-4">Activity</th>
								<th class="pb-2">Score</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.domain}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2 font-bold">{rule.score}/10</td>
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
						<span class="font-medium text-gray-600">Primary Diagnosis:</span>
						{data.referralInfo.primaryDiagnosis || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Referral Source:</span>
						{data.referralInfo.referralSource || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Referring Clinician:</span>
						{data.referralInfo.referringClinician || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Activity Difficulty Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Activity Difficulty Summary</h2>
				<div class="space-y-4">
					<div>
						<h3 class="mb-2 text-sm font-semibold text-gray-700">Self-Care Activities</h3>
						<div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
							<div>
								<span class="text-gray-600">Personal Care:</span>
								{#if data.selfCareActivities.personalCare.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.selfCareActivities.personalCare.difficulty)}">
										{difficultyLabel(data.selfCareActivities.personalCare.difficulty)}
									</span>
								{/if}
							</div>
							<div>
								<span class="text-gray-600">Functional Mobility:</span>
								{#if data.selfCareActivities.functionalMobility.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.selfCareActivities.functionalMobility.difficulty)}">
										{difficultyLabel(data.selfCareActivities.functionalMobility.difficulty)}
									</span>
								{/if}
							</div>
							<div>
								<span class="text-gray-600">Community Management:</span>
								{#if data.selfCareActivities.communityManagement.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.selfCareActivities.communityManagement.difficulty)}">
										{difficultyLabel(data.selfCareActivities.communityManagement.difficulty)}
									</span>
								{/if}
							</div>
						</div>
					</div>
					<div>
						<h3 class="mb-2 text-sm font-semibold text-gray-700">Productivity Activities</h3>
						<div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
							<div>
								<span class="text-gray-600">Paid Work:</span>
								{#if data.productivityActivities.paidWork.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.productivityActivities.paidWork.difficulty)}">
										{difficultyLabel(data.productivityActivities.paidWork.difficulty)}
									</span>
								{/if}
							</div>
							<div>
								<span class="text-gray-600">Household:</span>
								{#if data.productivityActivities.householdManagement.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.productivityActivities.householdManagement.difficulty)}">
										{difficultyLabel(data.productivityActivities.householdManagement.difficulty)}
									</span>
								{/if}
							</div>
							<div>
								<span class="text-gray-600">Education:</span>
								{#if data.productivityActivities.education.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.productivityActivities.education.difficulty)}">
										{difficultyLabel(data.productivityActivities.education.difficulty)}
									</span>
								{/if}
							</div>
						</div>
					</div>
					<div>
						<h3 class="mb-2 text-sm font-semibold text-gray-700">Leisure Activities</h3>
						<div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
							<div>
								<span class="text-gray-600">Quiet Recreation:</span>
								{#if data.leisureActivities.quietRecreation.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.leisureActivities.quietRecreation.difficulty)}">
										{difficultyLabel(data.leisureActivities.quietRecreation.difficulty)}
									</span>
								{/if}
							</div>
							<div>
								<span class="text-gray-600">Active Recreation:</span>
								{#if data.leisureActivities.activeRecreation.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.leisureActivities.activeRecreation.difficulty)}">
										{difficultyLabel(data.leisureActivities.activeRecreation.difficulty)}
									</span>
								{/if}
							</div>
							<div>
								<span class="text-gray-600">Social Participation:</span>
								{#if data.leisureActivities.socialParticipation.difficulty}
									<span class="ml-1 rounded px-2 py-0.5 text-xs {difficultyColor(data.leisureActivities.socialParticipation.difficulty)}">
										{difficultyLabel(data.leisureActivities.socialParticipation.difficulty)}
									</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Goals -->
			{#if data.goalsPriorities.shortTermGoals || data.goalsPriorities.longTermGoals}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Goals & Priorities</h2>
					<div class="space-y-3 text-sm">
						{#if data.goalsPriorities.shortTermGoals}
							<div>
								<span class="font-medium text-gray-600">Short-Term Goals:</span>
								<p class="mt-1">{data.goalsPriorities.shortTermGoals}</p>
							</div>
						{/if}
						{#if data.goalsPriorities.longTermGoals}
							<div>
								<span class="font-medium text-gray-600">Long-Term Goals:</span>
								<p class="mt-1">{data.goalsPriorities.longTermGoals}</p>
							</div>
						{/if}
						{#if data.goalsPriorities.priorityAreas}
							<div>
								<span class="font-medium text-gray-600">Priority Areas:</span>
								<p class="mt-1">{data.goalsPriorities.priorityAreas}</p>
							</div>
						{/if}
						{#if data.goalsPriorities.dischargeGoals}
							<div>
								<span class="font-medium text-gray-600">Discharge Goals:</span>
								<p class="mt-1">{data.goalsPriorities.dischargeGoals}</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</main>
	</div>
{/if}
