<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const rg = assessment.data.reproductiveGenetics;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Reproductive Genetics" description="Reproductive history relevant to genetic assessment">
	<RadioGroup label="Have you experienced recurrent miscarriages (3 or more)?" name="recurrentMiscarriages" options={yesNo} bind:value={rg.recurrentMiscarriages} />

	<RadioGroup label="Have you been diagnosed with infertility?" name="infertility" options={yesNo} bind:value={rg.infertility} />

	<RadioGroup label="Have you had a previous child affected by a genetic condition?" name="previousAffectedChild" options={yesNo} bind:value={rg.previousAffectedChild} />
	{#if rg.previousAffectedChild === 'yes'}
		<TextArea label="Please provide details" name="previousAffectedChildDetails" bind:value={rg.previousAffectedChildDetails} placeholder="Describe the condition affecting the child..." />
	{/if}

	<RadioGroup label="Are you and your partner related by blood (consanguineous)?" name="reproConsanguinity" options={yesNo} bind:value={rg.consanguinity} />

	<RadioGroup label="Are you a known carrier of a genetic condition?" name="carrierStatus" options={yesNo} bind:value={rg.carrierStatus} />
	{#if rg.carrierStatus === 'yes'}
		<TextArea label="Please provide details" name="carrierStatusDetails" bind:value={rg.carrierStatusDetails} placeholder="Which condition(s) are you a carrier for?" />
	{/if}
</SectionCard>
