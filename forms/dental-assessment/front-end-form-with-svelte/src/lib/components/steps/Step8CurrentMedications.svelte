<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Medications relevant to dental treatment">
	<RadioGroup label="Are you taking anticoagulants (blood thinners)?" name="anticoagulantUse" options={yesNo} bind:value={m.anticoagulantUse} />
	{#if m.anticoagulantUse === 'yes'}
		<TextInput label="Anticoagulant name and dose" name="anticoagulantType" bind:value={m.anticoagulantType} placeholder="e.g. Warfarin 5mg, Rivaroxaban 20mg" />
	{/if}

	<RadioGroup label="Are you currently taking bisphosphonates?" name="bisphosphonateCurrentUse" options={yesNo} bind:value={m.bisphosphonateCurrentUse} />
	{#if m.bisphosphonateCurrentUse === 'yes'}
		<TextInput label="Bisphosphonate name" name="bisphosphonateName" bind:value={m.bisphosphonateName} placeholder="e.g. Alendronate, Risedronate" />
	{/if}

	<RadioGroup label="Are you taking immunosuppressant medications?" name="immunosuppressantUse" options={yesNo} bind:value={m.immunosuppressantUse} />
	{#if m.immunosuppressantUse === 'yes'}
		<TextInput label="Immunosuppressant name" name="immunosuppressantName" bind:value={m.immunosuppressantName} placeholder="e.g. Methotrexate, Cyclosporin" />
	{/if}

	<RadioGroup label="Do you have any allergies to dental anaesthetics?" name="allergyToAnaesthetics" options={yesNo} bind:value={m.allergyToAnaesthetics} />
	{#if m.allergyToAnaesthetics === 'yes'}
		<TextInput label="Anaesthetic allergy details" name="anaestheticAllergyDetails" bind:value={m.anaestheticAllergyDetails} placeholder="e.g. Lidocaine - rash, Articaine - swelling" />
	{/if}

	<TextArea
		label="Other medications"
		name="otherMedications"
		bind:value={m.otherMedications}
		placeholder="List any other medications you are currently taking"
	/>
</SectionCard>
