<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte.js';

	function startAssessment() {
		assessment.reset();
		goto('/assessment/1');
	}
</script>

<svelte:head>
	<title>SCORE2-Diabetes Risk Assessment</title>
</svelte:head>

<div class="mx-auto max-w-2xl text-center">
	<div class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
		<h2 class="mb-4 text-2xl font-bold text-gray-800">
			SCORE2-Diabetes Cardiovascular Risk Assessment
		</h2>
		<p class="mb-6 text-gray-600">
			This assessment evaluates 10-year cardiovascular disease (CVD) risk in patients with
			type 2 diabetes, based on ESC 2023 guidelines. It evaluates clinical, metabolic, and
			lifestyle factors across 10 sections to determine overall risk category and generate
			actionable clinical recommendations.
		</p>

		<div class="mb-6 rounded-md bg-blue-50 p-4 text-left text-sm text-blue-800">
			<p class="font-semibold">Assessment includes:</p>
			<ul class="mt-2 list-inside list-disc space-y-1">
				<li>Patient demographics and diabetes history</li>
				<li>Cardiovascular history and blood pressure</li>
				<li>Lipid profile and renal function</li>
				<li>Lifestyle factors and current medications</li>
				<li>Complications screening and risk summary</li>
			</ul>
		</div>

		<button
			onclick={startAssessment}
			class="rounded-md bg-primary px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
		>
			Begin Assessment
		</button>
	</div>
</div>
