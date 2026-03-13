<script lang="ts">
	import type { Snippet } from 'svelte';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { getVisibleSteps } from '$lib/config/steps';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';

	let { children }: { children: Snippet } = $props();

	const visibleSteps = $derived(getVisibleSteps(assessment.data));
</script>

<div class="min-h-screen bg-gray-50">
	<header class="border-b border-gray-200 bg-white shadow-sm no-print">
		<div class="mx-auto max-w-3xl px-4 py-4">
			<h1 class="text-lg font-bold text-gray-900">Advance Statement About Care</h1>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-4 py-6">
		<ProgressBar currentStep={assessment.currentStep} steps={visibleSteps} />
		{@render children()}
	</main>
</div>
