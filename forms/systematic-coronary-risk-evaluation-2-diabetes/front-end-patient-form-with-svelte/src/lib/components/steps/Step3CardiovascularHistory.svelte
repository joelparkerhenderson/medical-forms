<script lang="ts">
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { CardiovascularHistory } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: CardiovascularHistory } = $props();

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cardiovascular History">
	<p class="mb-4 text-sm text-gray-500">
		Indicate whether the patient has a history of any of the following cardiovascular conditions.
	</p>

	<RadioGroup label="Previous Myocardial Infarction (MI)" name="previousMi" options={yesNo} bind:value={data.previousMi} />
	<RadioGroup label="Previous Stroke" name="previousStroke" options={yesNo} bind:value={data.previousStroke} />
	<RadioGroup label="Previous Transient Ischaemic Attack (TIA)" name="previousTia" options={yesNo} bind:value={data.previousTia} />
	<RadioGroup label="Peripheral Arterial Disease" name="peripheralArterialDisease" options={yesNo} bind:value={data.peripheralArterialDisease} />
	<RadioGroup label="Heart Failure" name="heartFailure" options={yesNo} bind:value={data.heartFailure} />
	<RadioGroup label="Atrial Fibrillation" name="atrialFibrillation" options={yesNo} bind:value={data.atrialFibrillation} />
	<RadioGroup
		label="Family History of Premature CVD"
		name="familyCvdHistory"
		options={yesNo}
		bind:value={data.familyCvdHistory}
		hint="First-degree relative with CVD before age 55 (male) or 65 (female)"
	/>

	{#if data.familyCvdHistory === 'yes'}
		<div class="mb-4">
			<label for="familyCvdDetails" class="block text-sm font-medium text-gray-700 mb-1"
				>Family CVD Details</label
			>
			<textarea
				id="familyCvdDetails"
				bind:value={data.familyCvdDetails}
				placeholder="e.g. Father had MI at age 52"
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
				rows="3"
			></textarea>
		</div>
	{/if}

	<RadioGroup label="Current Chest Pain" name="currentChestPain" options={yesNo} bind:value={data.currentChestPain} />
	<RadioGroup label="Current Dyspnoea (Breathlessness)" name="currentDyspnoea" options={yesNo} bind:value={data.currentDyspnoea} />
</SectionCard>
