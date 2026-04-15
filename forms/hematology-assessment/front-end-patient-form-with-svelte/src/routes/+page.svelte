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
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
				<svg class="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Hematology Assessment</h1>
			<p class="mt-3 text-gray-600">
				Haematological evaluation for blood disorders, anaemia screening, coagulation assessment,
				and complete blood count interpretation.
			</p>
		</div>

		<div class="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
			<h2 class="mb-3 font-semibold text-gray-900">What to expect</h2>
			<ul class="space-y-2 text-sm text-gray-600">
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					10 sections covering patient information and laboratory results
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					CBC, coagulation, iron studies, hemoglobinopathy, and bone marrow data
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					Automated abnormality scoring with flagged clinical concerns
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
					Comprehensive report with fired rules and additional flags
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
			This assessment tool is for clinical decision support only and does not replace professional medical judgement.
		</p>
	</div>
</div>
