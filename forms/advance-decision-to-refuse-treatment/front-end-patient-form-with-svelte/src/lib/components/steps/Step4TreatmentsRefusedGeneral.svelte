<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const g = assessment.data.treatmentsRefusedGeneral;
	const yesNo = [
		{ value: 'yes', label: 'Yes - Refuse' },
		{ value: 'no', label: 'No - Do not refuse' }
	];

	function addOtherTreatment() {
		g.otherTreatments = [...g.otherTreatments, { treatment: '', refused: 'yes', specification: '' }];
	}

	function removeOtherTreatment(index: number) {
		g.otherTreatments = g.otherTreatments.filter((_, i) => i !== index);
	}
</script>

<SectionCard title="Treatments Refused - General" description="Select which general treatments you wish to refuse in the circumstances described">
	<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
		<p class="font-semibold">Important</p>
		<p class="mt-1">This section covers general treatments that are NOT life-sustaining. Life-sustaining treatment refusals require additional legal safeguards and are covered in the next step.</p>
	</div>

	<div class="space-y-6">
		<div class="rounded-lg border border-gray-200 p-4">
			<RadioGroup label="Antibiotics" name="antibiotics" options={yesNo} bind:value={g.antibiotics.refused} />
			{#if g.antibiotics.refused === 'yes'}
				<TextArea label="Specification" name="antibioticsSpec" bind:value={g.antibiotics.specification} placeholder="Please specify which antibiotics or circumstances (e.g. 'only for life-threatening infections')" />
			{/if}
		</div>

		<div class="rounded-lg border border-gray-200 p-4">
			<RadioGroup label="Blood Transfusion" name="bloodTransfusion" options={yesNo} bind:value={g.bloodTransfusion.refused} />
			{#if g.bloodTransfusion.refused === 'yes'}
				<TextArea label="Specification" name="bloodSpec" bind:value={g.bloodTransfusion.specification} placeholder="Please specify any conditions or limitations" />
			{/if}
		</div>

		<div class="rounded-lg border border-gray-200 p-4">
			<RadioGroup label="IV Fluids" name="ivFluids" options={yesNo} bind:value={g.ivFluids.refused} />
			{#if g.ivFluids.refused === 'yes'}
				<TextArea label="Specification" name="ivSpec" bind:value={g.ivFluids.specification} placeholder="Please specify any conditions or limitations" />
			{/if}
		</div>

		<div class="rounded-lg border border-gray-200 p-4">
			<RadioGroup label="Tube Feeding" name="tubeFeeding" options={yesNo} bind:value={g.tubeFeeding.refused} />
			{#if g.tubeFeeding.refused === 'yes'}
				<TextArea label="Specification" name="tubeSpec" bind:value={g.tubeFeeding.specification} placeholder="Please specify any conditions or limitations" />
			{/if}
		</div>

		<div class="rounded-lg border border-gray-200 p-4">
			<RadioGroup label="Dialysis" name="dialysis" options={yesNo} bind:value={g.dialysis.refused} />
			{#if g.dialysis.refused === 'yes'}
				<TextArea label="Specification" name="dialysisSpec" bind:value={g.dialysis.specification} placeholder="Please specify any conditions or limitations" />
			{/if}
		</div>

		<div class="rounded-lg border border-gray-200 p-4">
			<RadioGroup label="Non-invasive Ventilation (e.g. CPAP/BiPAP)" name="ventilation" options={yesNo} bind:value={g.ventilation.refused} />
			{#if g.ventilation.refused === 'yes'}
				<TextArea label="Specification" name="ventSpec" bind:value={g.ventilation.specification} placeholder="Please specify any conditions or limitations" />
			{/if}
		</div>
	</div>

	<!-- Other treatments -->
	<div class="mt-6">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Other Treatments to Refuse</h3>
		{#each g.otherTreatments as other, i}
			<div class="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<input
							type="text"
							placeholder="Treatment name"
							bind:value={other.treatment}
							class="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
						<textarea
							placeholder="Specification"
							bind:value={other.specification}
							rows={2}
							class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						></textarea>
					</div>
					<button
						type="button"
						onclick={() => removeOtherTreatment(i)}
						class="ml-2 text-red-500 hover:text-red-700"
						aria-label="Remove treatment"
					>
						&times;
					</button>
				</div>
			</div>
		{/each}
		<button
			type="button"
			onclick={addOtherTreatment}
			class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
		>
			+ Add Another Treatment
		</button>
	</div>
</SectionCard>
