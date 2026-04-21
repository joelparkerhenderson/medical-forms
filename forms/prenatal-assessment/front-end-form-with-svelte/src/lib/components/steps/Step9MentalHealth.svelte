<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const m = assessment.data.mentalHealthScreening;
	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Mental Health Screening" description="Edinburgh Postnatal Depression Scale and wellbeing assessment">
	<NumberInput
		label="Edinburgh Postnatal Depression Scale (EPDS) Score"
		name="edinburghScore"
		bind:value={m.edinburghScore}
		min={0}
		max={30}
		required
	/>
	<p class="mb-4 -mt-2 text-xs text-gray-500">
		Score 0-9: Low risk | Score 10-12: Possible depression | Score 13+: Probable depression
	</p>

	<SelectInput
		label="Anxiety Level"
		name="anxietyLevel"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'mild', label: 'Mild' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'severe', label: 'Severe' }
		]}
		bind:value={m.anxietyLevel}
	/>

	<RadioGroup
		label="Do you have a support system (partner, family, friends)?"
		name="supportSystem"
		options={yesNoOptions}
		bind:value={m.supportSystem}
	/>

	<RadioGroup
		label="Domestic violence screening: Do you feel safe at home?"
		name="domesticViolenceScreen"
		options={[
			{ value: 'no', label: 'Yes, I feel safe' },
			{ value: 'yes', label: 'No, I do not feel safe' }
		]}
		bind:value={m.domesticViolenceScreen}
	/>
</SectionCard>
