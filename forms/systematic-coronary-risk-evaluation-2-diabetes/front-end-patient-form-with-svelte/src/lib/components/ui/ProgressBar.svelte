<script lang="ts">
	let {
		currentStep,
		totalSteps
	}: {
		currentStep: number;
		totalSteps: number;
	} = $props();

	let percentage = $derived(Math.round((currentStep / totalSteps) * 100));
</script>

<div class="mb-6">
	<div class="flex justify-between text-sm text-gray-600 mb-1">
		<span>Step {currentStep} of {totalSteps}</span>
		<span>{percentage}%</span>
	</div>
	<div class="h-2 w-full rounded-full bg-gray-200">
		<div
			class="h-2 rounded-full bg-primary transition-all duration-300"
			style="width: {percentage}%"
		></div>
	</div>
</div>
