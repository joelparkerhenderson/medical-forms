<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const m = assessment.data.musculoskeletalAirway;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Musculoskeletal & Airway" description="Joint, spine and airway assessment">
	<RadioGroup label="Do you have rheumatoid arthritis?" name="ra" options={yesNo} bind:value={m.rheumatoidArthritis} />

	<RadioGroup label="Do you have any cervical spine (neck) problems?" name="cspine" options={yesNo} bind:value={m.cervicalSpineIssues} />

	<RadioGroup label="Do you have limited neck movement?" name="neckMov" options={yesNo} bind:value={m.limitedNeckMovement} />

	<RadioGroup label="Do you have limited mouth opening?" name="mouthOpen" options={yesNo} bind:value={m.limitedMouthOpening} />

	<RadioGroup label="Do you have any dental issues (loose/capped teeth, dentures)?" name="dental" options={yesNo} bind:value={m.dentalIssues} />
	{#if m.dentalIssues === 'yes'}
		<TextInput label="Please provide details" name="dentalDetails" bind:value={m.dentalDetails} />
	{/if}

	<RadioGroup label="Have you ever been told you had a difficult airway?" name="diffAirway" options={yesNo} bind:value={m.previousDifficultAirway} />

	<SelectInput
		label="Mallampati Score (if known)"
		name="mallampati"
		options={[
			{ value: '1', label: 'Class 1' },
			{ value: '2', label: 'Class 2' },
			{ value: '3', label: 'Class 3' },
			{ value: '4', label: 'Class 4' }
		]}
		bind:value={m.mallampatiScore}
	/>
</SectionCard>
