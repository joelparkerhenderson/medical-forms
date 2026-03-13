<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const ha = assessment.data.currentHearingAids;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const aidTypeOptions = [
		{ value: 'BTE', label: 'Behind-the-ear (BTE)' },
		{ value: 'RIC', label: 'Receiver-in-canal (RIC)' },
		{ value: 'ITE', label: 'In-the-ear (ITE)' },
		{ value: 'ITC', label: 'In-the-canal (ITC)' },
		{ value: 'CIC', label: 'Completely-in-canal (CIC)' },
		{ value: 'IIC', label: 'Invisible-in-canal (IIC)' },
		{ value: 'bone-conduction', label: 'Bone conduction' },
		{ value: 'CROS', label: 'CROS/BiCROS' },
		{ value: 'other', label: 'Other' },
		{ value: 'none', label: 'None' }
	];

	const satisfactionOptions = [
		{ value: 'very-satisfied', label: 'Very satisfied' },
		{ value: 'satisfied', label: 'Satisfied' },
		{ value: 'neutral', label: 'Neutral' },
		{ value: 'dissatisfied', label: 'Dissatisfied' },
		{ value: 'very-dissatisfied', label: 'Very dissatisfied' }
	];
</script>

<SectionCard title="Current Hearing Aids" description="Information about any hearing aids you currently use">
	<RadioGroup
		label="Do you currently wear hearing aids?"
		name="hasHearingAids"
		options={yesNo}
		bind:value={ha.hasHearingAids}
		required
	/>

	{#if ha.hasHearingAids === 'yes'}
		<SelectInput
			label="Left ear hearing aid type"
			name="leftAidType"
			options={aidTypeOptions}
			bind:value={ha.leftAidType}
		/>

		<SelectInput
			label="Right ear hearing aid type"
			name="rightAidType"
			options={aidTypeOptions}
			bind:value={ha.rightAidType}
		/>

		<TextInput
			label="How old are your current hearing aids?"
			name="aidAge"
			bind:value={ha.aidAge}
			placeholder="e.g., 2 years, 6 months"
		/>

		<RadioGroup
			label="How satisfied are you with your current hearing aids?"
			name="satisfaction"
			options={satisfactionOptions}
			bind:value={ha.satisfaction}
		/>

		<NumberInput
			label="Average daily use"
			name="dailyUseHours"
			bind:value={ha.dailyUseHours}
			unit="hours"
			min={0}
			max={24}
			step={0.5}
		/>

		<TextArea
			label="Any difficulties or complaints with your current hearing aids?"
			name="difficulties"
			bind:value={ha.difficulties}
			placeholder="e.g., feedback, discomfort, difficulty with settings..."
		/>
	{/if}
</SectionCard>
