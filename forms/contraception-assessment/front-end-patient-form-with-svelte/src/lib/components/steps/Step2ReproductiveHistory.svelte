<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const r = assessment.data.reproductiveHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Reproductive History" description="Pregnancy and reproductive background">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Gravida (total pregnancies)"
			name="gravida"
			bind:value={r.gravida}
			min={0}
			max={20}
		/>
		<NumberInput
			label="Para (births past 24 weeks)"
			name="para"
			bind:value={r.para}
			min={0}
			max={20}
		/>
	</div>

	<TextInput
		label="Date of last delivery"
		name="lastDeliveryDate"
		type="date"
		bind:value={r.lastDeliveryDate}
	/>

	<RadioGroup
		label="Are you currently breastfeeding?"
		name="breastfeeding"
		options={yesNo}
		bind:value={r.breastfeeding}
	/>

	<TextArea
		label="Pregnancy intention"
		name="pregnancyIntention"
		bind:value={r.pregnancyIntention}
		placeholder="Describe your plans regarding future pregnancies..."
	/>
</SectionCard>
