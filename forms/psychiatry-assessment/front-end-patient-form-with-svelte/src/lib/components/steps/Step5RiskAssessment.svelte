<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const r = assessment.data.riskAssessment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Risk Assessment" description="Assessment of risk to self and others">
	<RadioGroup label="Is the patient experiencing suicidal ideation?" name="suicidalIdeation" options={yesNo} bind:value={r.suicidalIdeation} />

	{#if r.suicidalIdeation === 'yes'}
		<RadioGroup label="Does the patient have a suicide plan?" name="suicidalPlan" options={yesNo} bind:value={r.suicidalPlan} />
		<RadioGroup label="Does the patient express intent to act?" name="suicidalIntent" options={yesNo} bind:value={r.suicidalIntent} />
		<RadioGroup label="Does the patient have access to means?" name="suicidalMeans" options={yesNo} bind:value={r.suicidalMeans} />
	{/if}

	<TextArea label="Protective Factors" name="protectiveFactors" bind:value={r.protectiveFactors} placeholder="e.g. family support, children, religious beliefs, future plans" />

	<RadioGroup label="Current self-harm behaviour?" name="selfHarmCurrent" options={yesNo} bind:value={r.selfHarmCurrent} />

	<SelectInput
		label="Violence Risk"
		name="violenceRisk"
		options={[
			{ value: 'none', label: 'None identified' },
			{ value: 'low', label: 'Low' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'high', label: 'High' },
			{ value: 'imminent', label: 'Imminent' }
		]}
		bind:value={r.violenceRisk}
	/>

	<RadioGroup label="Safeguarding concerns?" name="safeguarding" options={yesNo} bind:value={r.safeguardingConcerns} />
	{#if r.safeguardingConcerns === 'yes'}
		<TextArea label="Safeguarding Details" name="safeguardingDetails" bind:value={r.safeguardingDetails} placeholder="Details of safeguarding concerns" />
	{/if}
</SectionCard>
