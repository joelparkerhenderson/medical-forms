<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const b = assessment.data.birthHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Birth History" description="Details about the child's birth">
	<NumberInput label="Gestational Age at Birth" name="gestAge" bind:value={b.gestationalAge} unit="weeks" min={20} max={44} required />
	<NumberInput label="Birth Weight" name="birthWeight" bind:value={b.birthWeight} unit="kg" min={0.3} max={7} step={0.01} required />

	<SelectInput
		label="Delivery Type"
		name="deliveryType"
		options={[
			{ value: 'vaginal', label: 'Vaginal' },
			{ value: 'caesarean-elective', label: 'Caesarean (Elective)' },
			{ value: 'caesarean-emergency', label: 'Caesarean (Emergency)' },
			{ value: 'assisted', label: 'Assisted (Forceps/Vacuum)' }
		]}
		bind:value={b.deliveryType}
		required
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="APGAR Score (1 minute)" name="apgar1" bind:value={b.apgarOneMinute} min={0} max={10} />
		<NumberInput label="APGAR Score (5 minutes)" name="apgar5" bind:value={b.apgarFiveMinutes} min={0} max={10} />
	</div>

	<RadioGroup label="Was there a NICU stay?" name="nicu" options={yesNo} bind:value={b.nicuStay} />
	{#if b.nicuStay === 'yes'}
		<NumberInput label="Duration of NICU stay" name="nicuDuration" bind:value={b.nicuDuration} unit="days" min={1} max={365} />
	{/if}

	<RadioGroup label="Were there any birth complications?" name="birthComp" options={yesNo} bind:value={b.birthComplications} />
	{#if b.birthComplications === 'yes'}
		<TextArea label="Please describe the complications" name="birthCompDetails" bind:value={b.birthComplicationDetails} />
	{/if}
</SectionCard>
