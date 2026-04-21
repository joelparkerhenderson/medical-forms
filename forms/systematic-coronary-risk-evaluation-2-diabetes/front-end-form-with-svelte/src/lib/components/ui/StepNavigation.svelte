<script lang="ts">
	let {
		currentStep,
		totalSteps,
		onPrevious,
		onNext,
		onSubmit
	}: {
		currentStep: number;
		totalSteps: number;
		onPrevious?: () => void;
		onNext?: () => void;
		onSubmit?: () => void;
	} = $props();

	const isFirst = $derived(currentStep === 1);
	const isLast = $derived(currentStep === totalSteps);
</script>

<div class="mt-8 flex justify-between">
	{#if !isFirst && onPrevious}
		<button
			type="button"
			onclick={onPrevious}
			class="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
		>
			Previous
		</button>
	{:else}
		<span></span>
	{/if}

	{#if isLast && onSubmit}
		<button
			type="button"
			onclick={onSubmit}
			class="rounded-md bg-success px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
		>
			Submit Assessment
		</button>
	{:else if onNext}
		<button
			type="button"
			onclick={onNext}
			class="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark"
		>
			Next
		</button>
	{/if}
</div>
