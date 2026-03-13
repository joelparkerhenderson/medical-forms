<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const m = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="GI-related and other medications you are currently taking">
	<RadioGroup label="Are you taking proton pump inhibitors (PPIs) such as omeprazole, lansoprazole?" name="ppis" options={yesNo} bind:value={m.ppis} />
	{#if m.ppis === 'yes'}
		<TextInput label="Which PPI and dose?" name="ppiDetails" bind:value={m.ppiDetails} />
	{/if}

	<RadioGroup label="Are you taking antacids (e.g. Gaviscon, Rennie)?" name="antacids" options={yesNo} bind:value={m.antacids} />

	<RadioGroup label="Are you taking laxatives?" name="laxatives" options={yesNo} bind:value={m.laxatives} />
	{#if m.laxatives === 'yes'}
		<TextInput label="Which laxative?" name="laxativeDetails" bind:value={m.laxativeDetails} />
	{/if}

	<RadioGroup label="Are you taking anti-diarrhoeal medication (e.g. loperamide)?" name="antiDiarrhoeals" options={yesNo} bind:value={m.antiDiarrhoeals} />

	<RadioGroup label="Are you on biologic therapy (e.g. infliximab, adalimumab)?" name="biologics" options={yesNo} bind:value={m.biologics} />
	{#if m.biologics === 'yes'}
		<TextInput label="Which biologic?" name="biologicDetails" bind:value={m.biologicDetails} />
	{/if}

	<RadioGroup label="Are you taking steroids (e.g. prednisolone, budesonide)?" name="steroids" options={yesNo} bind:value={m.steroids} />
	{#if m.steroids === 'yes'}
		<TextInput label="Which steroid and dose?" name="steroidDetails" bind:value={m.steroidDetails} />
	{/if}

	<RadioGroup label="Are you taking NSAIDs (e.g. ibuprofen, naproxen, aspirin)?" name="nsaids" options={yesNo} bind:value={m.nsaids} />
	{#if m.nsaids === 'yes'}
		<TextInput label="Which NSAID?" name="nsaidDetails" bind:value={m.nsaidDetails} />
	{/if}

	<div class="mt-6">
		<h3 class="mb-3 text-sm font-medium text-gray-700">Other Medications</h3>
		<MedicationEntry bind:medications={m.otherMedications} />
		{#if m.otherMedications.length === 0}
			<p class="mt-3 text-sm text-gray-500">No other medications added. Click the button above to add one, or proceed if you take none.</p>
		{/if}
	</div>
</SectionCard>
