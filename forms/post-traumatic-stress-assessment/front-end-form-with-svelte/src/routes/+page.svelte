<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { gradeAssessment } from '$lib/engine/pcl5-grader';
	import { categoryColor, categoryDescription } from '$lib/engine/utils';
	import Step1Demographics from '$lib/components/steps/Step1Demographics.svelte';
	import Step2TraumaEventIdentification from '$lib/components/steps/Step2TraumaEventIdentification.svelte';
	import Step3IntrusionSymptoms from '$lib/components/steps/Step3IntrusionSymptoms.svelte';
	import Step4AvoidanceSymptoms from '$lib/components/steps/Step4AvoidanceSymptoms.svelte';
	import Step5NegativeAlterations from '$lib/components/steps/Step5NegativeAlterations.svelte';
	import Step6ArousalReactivity from '$lib/components/steps/Step6ArousalReactivity.svelte';

	const submitted = $derived(assessment.result !== null);

	const priorityColor: Record<string, string> = {
		high: 'bg-red-100 text-red-800 border-red-300',
		medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		low: 'bg-gray-100 text-gray-700 border-gray-300'
	};

	function submitForm() {
		assessment.result = gradeAssessment(assessment.data);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function startNew() {
		assessment.reset();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Post-Traumatic Stress Assessment (PCL-5)</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="border-b border-nhs-blue bg-nhs-blue shadow-sm no-print">
		<div class="mx-auto max-w-2xl px-4 py-4">
			<h1 class="text-xl font-bold text-white">Post-Traumatic Stress Assessment</h1>
			<p class="mt-0.5 text-sm text-blue-100">
				PCL-5 · PTSD Checklist for DSM-5 · 20 items · past-month timeframe
			</p>
		</div>
	</header>

	<main class="mx-auto max-w-2xl px-4 py-8">
		{#if submitted && assessment.result}
			{@const r = assessment.result}
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-2xl font-bold text-gray-900">PCL-5 Result</h2>
				<div class="flex gap-3 no-print">
					<button onclick={() => window.print()} class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Print</button>
					<button onclick={startNew} class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">New Form</button>
				</div>
			</div>

			<div class="mb-6 rounded-xl border-2 p-6 text-center {categoryColor(r.category)}">
				<div class="text-4xl font-bold">{r.totalScore} / 80</div>
				<div class="mt-1 text-xl font-semibold">{r.category}</div>
				<div class="mt-1 text-sm">{categoryDescription(r.category)}</div>
				{#if r.probableDsm5Diagnosis}
					<div class="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-gray-900">
						DSM-5 symptom pattern met — probable PTSD (provisional)
					</div>
				{/if}
			</div>

			<div class="mb-6 grid grid-cols-4 gap-3">
				<div class="rounded-lg border border-gray-200 bg-white p-3 text-center">
					<div class="text-xs uppercase text-gray-500">B — Intrusion</div>
					<div class="text-lg font-semibold">{r.clusterScores.b} / 20</div>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 text-center">
					<div class="text-xs uppercase text-gray-500">C — Avoidance</div>
					<div class="text-lg font-semibold">{r.clusterScores.c} / 8</div>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 text-center">
					<div class="text-xs uppercase text-gray-500">D — Neg. Alterations</div>
					<div class="text-lg font-semibold">{r.clusterScores.d} / 28</div>
				</div>
				<div class="rounded-lg border border-gray-200 bg-white p-3 text-center">
					<div class="text-xs uppercase text-gray-500">E — Arousal</div>
					<div class="text-lg font-semibold">{r.clusterScores.e} / 24</div>
				</div>
			</div>

			{#if r.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h3 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h3>
					<div class="space-y-2">
						{#each r.additionalFlags as flag}
							<div class="flex items-start gap-3 rounded-lg border p-3 {priorityColor[flag.priority]}">
								<span class="mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase {priorityColor[flag.priority]}">{flag.priority}</span>
								<div><span class="font-medium">{flag.category}:</span> {flag.message}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if r.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h3 class="mb-4 text-lg font-bold text-gray-900">Fired Rules</h3>
					<ul class="space-y-2 text-sm">
						{#each r.firedRules as rule}
							<li class="flex gap-3">
								<span class="font-mono text-xs text-gray-500">{rule.id}</span>
								<span class="font-medium">{rule.category}:</span>
								<span>{rule.description}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
				<strong>Note:</strong> the PCL-5 is a screening and self-report instrument. A formal PTSD diagnosis requires a structured clinical interview (for example CAPS-5) by a qualified clinician alongside corroborating history and examination.
			</div>
		{:else}
			<div class="mb-8"><Step1Demographics /></div>
			<div class="mb-8"><Step2TraumaEventIdentification /></div>
			<div class="mb-8"><Step3IntrusionSymptoms /></div>
			<div class="mb-8"><Step4AvoidanceSymptoms /></div>
			<div class="mb-8"><Step5NegativeAlterations /></div>
			<div class="mb-8"><Step6ArousalReactivity /></div>

			<div class="mx-auto max-w-2xl">
				<button onclick={submitForm} class="w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark">
					Calculate PCL-5 Score
				</button>
				<p class="mt-3 text-center text-xs text-gray-400">
					Scoring: sum of 20 items, each 0-4. Provisional PTSD cut-off is ≥ 33.
				</p>
			</div>
		{/if}
	</main>
</div>
