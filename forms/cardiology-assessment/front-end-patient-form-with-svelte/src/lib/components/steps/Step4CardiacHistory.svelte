<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const c = assessment.data.cardiacHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cardiac History" description="Previous MI, interventions, valvular and structural disease">
	<RadioGroup label="Have you had a previous heart attack (myocardial infarction)?" name="prevMI" options={yesNo} bind:value={c.previousMI} />
	{#if c.previousMI === 'yes'}
		<TextInput label="When did it occur?" name="miDate" type="date" bind:value={c.miDate} />
		<RadioGroup label="Was it within the last 6 months?" name="recentMI" options={yesNo} bind:value={c.recentMI} />
		{#if c.recentMI === 'yes'}
			<NumberInput label="How many weeks ago?" name="recentMIWeeks" bind:value={c.recentMIWeeks} min={0} max={26} required />
		{/if}
	{/if}

	<RadioGroup label="Have you had PCI (stent/angioplasty)?" name="pci" options={yesNo} bind:value={c.pci} />
	{#if c.pci === 'yes'}
		<TextInput label="PCI details" name="pciDetails" bind:value={c.pciDetails} placeholder="e.g. Year, vessels treated" />
	{/if}

	<RadioGroup label="Have you had CABG (bypass surgery)?" name="cabg" options={yesNo} bind:value={c.cabg} />
	{#if c.cabg === 'yes'}
		<TextInput label="CABG details" name="cabgDetails" bind:value={c.cabgDetails} placeholder="e.g. Year, number of grafts" />
	{/if}

	<RadioGroup label="Do you have any heart valve disease?" name="valvular" options={yesNo} bind:value={c.valvularDisease} />
	{#if c.valvularDisease === 'yes'}
		<TextInput label="Valve disease details" name="valvularDetails" bind:value={c.valvularDetails} placeholder="e.g. Aortic stenosis, mitral regurgitation" />
	{/if}

	<RadioGroup label="Have you been diagnosed with cardiomyopathy?" name="cardiomyopathy" options={yesNo} bind:value={c.cardiomyopathy} />
	{#if c.cardiomyopathy === 'yes'}
		<SelectInput
			label="Type of cardiomyopathy"
			name="cardiomyopathyType"
			options={[
				{ value: 'dilated', label: 'Dilated' },
				{ value: 'hypertrophic', label: 'Hypertrophic' },
				{ value: 'restrictive', label: 'Restrictive' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={c.cardiomyopathyType}
		/>
	{/if}

	<RadioGroup label="Have you had pericarditis?" name="pericarditis" options={yesNo} bind:value={c.pericarditis} />
</SectionCard>
