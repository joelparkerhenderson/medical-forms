<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const h = assessment.data.hearingHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Hearing History" description="Details about your hearing loss and related conditions">
	<RadioGroup
		label="How did your hearing loss begin?"
		name="onsetType"
		options={[
			{ value: 'sudden', label: 'Sudden' },
			{ value: 'gradual', label: 'Gradual' }
		]}
		bind:value={h.onsetType}
		required
	/>

	<TextInput
		label="How long have you had hearing difficulties?"
		name="duration"
		bind:value={h.duration}
		placeholder="e.g., 2 years, 6 months, since childhood"
		required
	/>

	<RadioGroup
		label="Which ear is affected?"
		name="affectedEar"
		options={[
			{ value: 'left', label: 'Left' },
			{ value: 'right', label: 'Right' },
			{ value: 'both', label: 'Both' }
		]}
		bind:value={h.affectedEar}
		required
	/>

	<RadioGroup label="Is there a family history of hearing loss?" name="familyHistory" options={yesNo} bind:value={h.familyHistory} />

	<RadioGroup label="Have you had significant noise exposure (occupational or recreational)?" name="noiseExposure" options={yesNo} bind:value={h.noiseExposure} />

	<RadioGroup label="Do you experience tinnitus (ringing, buzzing, or other sounds in your ears)?" name="tinnitus" options={yesNo} bind:value={h.tinnitus} />

	<RadioGroup label="Do you experience vertigo or dizziness?" name="vertigo" options={yesNo} bind:value={h.vertigo} />

	<RadioGroup label="Have you had any ear surgery?" name="earSurgery" options={yesNo} bind:value={h.earSurgery} />

	<RadioGroup label="Have you taken any ototoxic medications (e.g., aminoglycosides, cisplatin)?" name="ototoxicMedications" options={yesNo} bind:value={h.ototoxicMedications} />
</SectionCard>
