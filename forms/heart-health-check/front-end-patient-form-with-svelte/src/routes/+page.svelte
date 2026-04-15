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
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-gray-900">Heart Health Check</h1>
			<p class="mt-3 text-gray-600">
				Cardiovascular risk assessment based on QRISK3 methodology.
				Calculates 10-year CVD risk, heart age, and identifies modifiable risk factors.
			</p>
		</div>

		<div class="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
			<h2 class="mb-3 font-semibold text-gray-900">What this assessment covers</h2>
			<ul class="space-y-2 text-sm text-gray-600">
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger"></span>
					10 sections from patient demographics to clinical review
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger"></span>
					10-year CVD risk estimation and heart age calculation
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger"></span>
					20 risk rules across high, medium, and low risk levels
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger"></span>
					13 flagged issues for clinical safety review
				</li>
			</ul>
		</div>

		<button
			onclick={startAssessment}
			class="mt-6 w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark"
		>
			Begin Heart Health Check
		</button>

		<p class="mt-4 text-xs text-gray-400">
			This tool is for clinical support only. All assessments must be reviewed by a qualified clinician.
		</p>
	</div>
</div>
