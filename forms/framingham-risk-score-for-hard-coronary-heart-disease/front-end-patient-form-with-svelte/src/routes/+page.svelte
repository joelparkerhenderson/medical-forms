<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';

	function startAssessment() {
		assessment.reset();
		goto('/assessment');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-lg text-center">
		<div class="mb-8">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
				<svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Framingham Risk Score</h1>
			<p class="mt-1 text-lg text-gray-500">Hard Coronary Heart Disease</p>
			<p class="mt-3 text-gray-600">
				Estimates 10-year risk of heart attack in patients aged 30-79 with no history
				of CHD or diabetes, using the Wilson/D'Agostino 1998 Cox regression model.
			</p>
		</div>

		<div class="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
			<h2 class="mb-3 font-semibold text-gray-900">What to expect</h2>
			<ul class="space-y-2 text-sm text-gray-600">
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					10 sections covering patient demographics, risk factors, and clinical data
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					Takes approximately 5-10 minutes to complete
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					You can navigate back to change answers at any time
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					A risk report will be generated with 10-year CHD risk percentage
				</li>
			</ul>
		</div>

		<button
			onclick={startAssessment}
			class="mt-6 w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark"
		>
			Begin Assessment
		</button>

		<p class="mt-4 text-xs text-gray-400">
			This tool is for clinical support only. All assessments must be reviewed by a qualified clinician.
		</p>
	</div>
</div>
