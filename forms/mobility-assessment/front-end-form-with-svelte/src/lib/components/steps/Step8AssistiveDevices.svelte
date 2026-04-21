<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ad = assessment.data.assistiveDevices;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Assistive Devices" description="Current and recommended mobility aids">
	<CheckboxGroup
		label="Current Assistive Devices"
		options={[
			{ value: 'cane', label: 'Cane' },
			{ value: 'quad-cane', label: 'Quad cane' },
			{ value: 'walker', label: 'Walker' },
			{ value: 'rollator', label: 'Rollator' },
			{ value: 'wheelchair', label: 'Wheelchair' },
			{ value: 'scooter', label: 'Scooter' },
			{ value: 'crutches', label: 'Crutches' },
			{ value: 'orthotics', label: 'Orthotics/Braces' },
			{ value: 'none', label: 'None' }
		]}
		bind:values={ad.currentDevices}
	/>

	{#if ad.currentDevices.length > 0 && !ad.currentDevices.includes('none')}
		<RadioGroup
			label="Is the current device fit adequate?"
			name="deviceFitAdequate"
			options={yesNo}
			bind:value={ad.deviceFitAdequate}
		/>

		<TextArea
			label="Device Condition"
			name="deviceCondition"
			bind:value={ad.deviceCondition}
			placeholder="Describe the condition of the current device(s)..."
		/>
	{/if}

	<TextArea
		label="Recommended Devices or Modifications"
		name="recommendedDevices"
		bind:value={ad.recommendedDevices}
		placeholder="Any recommended assistive devices or modifications..."
	/>
</SectionCard>
