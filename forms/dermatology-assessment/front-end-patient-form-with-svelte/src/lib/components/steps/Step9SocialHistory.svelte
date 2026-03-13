<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.socialHistory;
</script>

<SectionCard title="Social History" description="Lifestyle factors relevant to skin health">
	<SelectInput
		label="Sun exposure level"
		name="sunExposure"
		options={[
			{ value: 'minimal', label: 'Minimal (mostly indoors)' },
			{ value: 'moderate', label: 'Moderate (some outdoor time)' },
			{ value: 'frequent', label: 'Frequent (regular outdoor activities)' },
			{ value: 'excessive', label: 'Excessive (prolonged daily exposure)' }
		]}
		bind:value={s.sunExposure}
	/>

	<SelectInput
		label="Tanning history"
		name="tanningHistory"
		options={[
			{ value: 'never', label: 'Never' },
			{ value: 'occasional', label: 'Occasional outdoor tanning' },
			{ value: 'regular-outdoor', label: 'Regular outdoor tanning' },
			{ value: 'tanning-bed', label: 'Tanning bed use (current or past)' }
		]}
		bind:value={s.tanningHistory}
	/>

	<TextInput
		label="Occupation"
		name="occupation"
		bind:value={s.occupation}
		placeholder="e.g., outdoor worker, hairdresser, healthcare..."
	/>

	<TextArea
		label="Cosmetics and skincare products regularly used"
		name="cosmeticsUse"
		bind:value={s.cosmeticsUse}
		placeholder="List any cosmetics, skincare, or hair products you use regularly..."
	/>
</SectionCard>
