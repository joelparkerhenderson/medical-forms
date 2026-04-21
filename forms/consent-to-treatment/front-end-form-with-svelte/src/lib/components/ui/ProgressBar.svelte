<script lang="ts">
	import type { StepConfig } from '$lib/engine/types';

	let {
		currentStep,
		steps
	}: {
		currentStep: number;
		steps: StepConfig[];
	} = $props();

	const progress = $derived(
		steps.length > 0 ? ((steps.findIndex((s) => s.number === currentStep) + 1) / steps.length) * 100 : 0
	);
	const currentIndex = $derived(steps.findIndex((s) => s.number === currentStep) + 1);
</script>

<div class="mb-6">
	<div class="mb-2 flex items-center justify-between text-sm text-gray-600">
		<span>Step {currentIndex} of {steps.length}</span>
		<span>{Math.round(progress)}% complete</span>
	</div>
	<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Form progress">
		<div
			class="h-2 rounded-full bg-primary transition-all duration-300"
			style="width: {progress}%"
		></div>
	</div>
</div>
