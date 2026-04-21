<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const ld = assessment.data.languageDysarthria;
</script>

<SectionCard title="Language & Dysarthria" description="NIHSS Items 9 and 10">
	<RadioGroup
		label="9. Best Language"
		name="bestLanguage"
		options={[
			{ value: '0', label: '0 - No aphasia; normal' },
			{ value: '1', label: '1 - Mild-to-moderate aphasia' },
			{ value: '2', label: '2 - Severe aphasia' },
			{ value: '3', label: '3 - Mute, global aphasia, no usable speech' }
		]}
		bind:value={ld.bestLanguage as any}
		required
	/>

	<RadioGroup
		label="10. Dysarthria"
		name="dysarthria"
		options={[
			{ value: '0', label: '0 - Normal' },
			{ value: '1', label: '1 - Mild-to-moderate slurring' },
			{ value: '2', label: '2 - Near unintelligible or worse' }
		]}
		bind:value={ld.dysarthria as any}
		required
	/>
</SectionCard>
