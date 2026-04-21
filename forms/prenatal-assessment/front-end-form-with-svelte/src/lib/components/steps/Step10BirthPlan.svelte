<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const b = assessment.data.birthPlanPreferences;
</script>

<SectionCard title="Birth Plan Preferences" description="Your preferences for labour, delivery, and postnatal care">
	<SelectInput
		label="Delivery Preference"
		name="deliveryPreference"
		options={[
			{ value: 'vaginal', label: 'Vaginal delivery' },
			{ value: 'water-birth', label: 'Water birth' },
			{ value: 'home-birth', label: 'Home birth' },
			{ value: 'elective-cesarean', label: 'Elective cesarean section' },
			{ value: 'vbac', label: 'VBAC (Vaginal birth after cesarean)' },
			{ value: 'no-preference', label: 'No preference' }
		]}
		bind:value={b.deliveryPreference}
	/>

	<SelectInput
		label="Pain Management"
		name="painManagement"
		options={[
			{ value: 'natural', label: 'Natural / No pain relief' },
			{ value: 'gas-air', label: 'Gas and air (Entonox)' },
			{ value: 'pethidine', label: 'Pethidine / Diamorphine' },
			{ value: 'epidural', label: 'Epidural' },
			{ value: 'tens', label: 'TENS machine' },
			{ value: 'combination', label: 'Open to a combination' },
			{ value: 'undecided', label: 'Undecided' }
		]}
		bind:value={b.painManagement}
	/>

	<SelectInput
		label="Feeding Plan"
		name="feedingPlan"
		options={[
			{ value: 'breastfeeding', label: 'Breastfeeding' },
			{ value: 'formula', label: 'Formula feeding' },
			{ value: 'combination', label: 'Combination feeding' },
			{ value: 'undecided', label: 'Undecided' }
		]}
		bind:value={b.feedingPlan}
	/>

	<TextArea
		label="Special Requests or Notes"
		name="specialRequests"
		bind:value={b.specialRequests}
		placeholder="e.g., Skin-to-skin contact immediately after birth, delayed cord clamping, cultural or religious considerations..."
		rows={4}
	/>
</SectionCard>
