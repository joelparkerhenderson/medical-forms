<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.medicalHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="Conditions and medications affecting hearing">
	<RadioGroup label="Are you taking any ototoxic medications (e.g., aminoglycosides, cisplatin, loop diuretics, aspirin)?" name="ototoxicMeds" options={yesNo} bind:value={m.ototoxicMedications} />
	{#if m.ototoxicMedications === 'yes'}
		<TextInput label="Please list the medications" name="ototoxicDetails" bind:value={m.ototoxicMedicationDetails} />
	{/if}

	<RadioGroup label="Do you have an autoimmune condition?" name="autoimmune" options={yesNo} bind:value={m.autoimmune} />
	{#if m.autoimmune === 'yes'}
		<TextInput label="Please specify" name="autoimmuneDetails" bind:value={m.autoimmuneDetails} />
	{/if}

	<RadioGroup label="Have you been diagnosed with Meniere's disease?" name="menieres" options={yesNo} bind:value={m.menieres} />

	<RadioGroup label="Have you been diagnosed with otosclerosis?" name="otosclerosis" options={yesNo} bind:value={m.otosclerosis} />

	<RadioGroup label="Have you been diagnosed with an acoustic neuroma (vestibular schwannoma)?" name="acousticNeuroma" options={yesNo} bind:value={m.acousticNeuroma} />

	<RadioGroup label="Have you had ear infections?" name="infections" options={yesNo} bind:value={m.infections} />
	{#if m.infections === 'yes'}
		<TextArea label="Please describe (frequency, type, treatment)" name="infectionDetails" bind:value={m.infectionDetails} />
	{/if}
</SectionCard>
