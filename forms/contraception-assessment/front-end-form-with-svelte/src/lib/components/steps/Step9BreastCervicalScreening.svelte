<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const s = assessment.data.breastCervicalScreening;
</script>

<SectionCard title="Breast & Cervical Screening" description="Screening history relevant to contraceptive counselling">
	<TextInput
		label="Date of last breast screening"
		name="lastBreastScreening"
		type="date"
		bind:value={s.lastBreastScreening}
	/>

	<TextInput
		label="Date of last cervical screening (smear test)"
		name="lastCervicalScreening"
		type="date"
		bind:value={s.lastCervicalScreening}
	/>

	<SelectInput
		label="HPV vaccination status"
		name="hpvVaccination"
		options={[
			{ value: 'completed', label: 'Completed (all doses)' },
			{ value: 'partial', label: 'Partially vaccinated' },
			{ value: 'none', label: 'Not vaccinated' },
			{ value: 'unsure', label: 'Unsure' }
		]}
		bind:value={s.hpvVaccination}
	/>
</SectionCard>
