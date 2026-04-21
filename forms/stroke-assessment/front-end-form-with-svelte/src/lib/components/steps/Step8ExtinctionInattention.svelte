<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const ei = assessment.data.extinctionInattention;
</script>

<SectionCard title="Extinction & Inattention" description="NIHSS Item 11">
	<RadioGroup
		label="11. Extinction and Inattention (formerly Neglect)"
		name="extinctionInattention"
		options={[
			{ value: '0', label: '0 - No abnormality' },
			{ value: '1', label: '1 - Visual, tactile, auditory, or spatial inattention to one modality' },
			{ value: '2', label: '2 - Profound hemi-inattention or extinction to more than one modality' }
		]}
		bind:value={ei.extinctionInattention as any}
		required
	/>
</SectionCard>
