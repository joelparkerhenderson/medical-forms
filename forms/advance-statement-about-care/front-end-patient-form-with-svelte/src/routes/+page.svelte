<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';

	function startStatement() {
		assessment.reset();
		goto('/assessment/1');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-lg text-center">
		<div class="mb-8">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
				<svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Advance Statement About Care</h1>
			<p class="mt-3 text-gray-600">
				An advance statement is a written record of your wishes, values, and preferences
				for future care. It is used if you lose the capacity to make or communicate decisions
				for yourself.
			</p>
		</div>

		<div class="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
			<h2 class="mb-3 font-semibold text-gray-900">What is an Advance Statement?</h2>
			<p class="mb-4 text-sm text-gray-600">
				Under the Mental Capacity Act 2005, an advance statement records your preferences
				and wishes about your future care. Unlike an Advance Decision to Refuse Treatment (ADRT),
				it is not legally binding, but your care team must take it into account when making
				decisions in your best interests.
			</p>

			<h2 class="mb-3 font-semibold text-gray-900">What to expect</h2>
			<ul class="space-y-2 text-sm text-gray-600">
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					9 sections covering your personal details, values, care preferences, and wishes
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					Takes approximately 20-30 minutes to complete thoughtfully
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					You can navigate back to change answers at any time
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					A formal document will be generated for inclusion in your medical records
				</li>
			</ul>
		</div>

		<button
			onclick={startStatement}
			class="mt-6 w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark"
		>
			Begin Statement
		</button>

		<p class="mt-4 text-xs text-gray-400">
			This document should be completed when you have mental capacity. You may wish to
			discuss it with your family, carers, or healthcare team.
		</p>
	</div>
</div>
