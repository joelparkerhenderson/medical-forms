<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const las = assessment.data.limbAtaxiaSensory;
</script>

<SectionCard title="Limb Ataxia & Sensory" description="NIHSS Items 7 and 8">
	<RadioGroup
		label="7. Limb Ataxia (finger-nose-finger, heel-shin)"
		name="limbAtaxia"
		options={[
			{ value: '0', label: '0 - Absent' },
			{ value: '1', label: '1 - Present in one limb' },
			{ value: '2', label: '2 - Present in two or more limbs' }
		]}
		bind:value={las.limbAtaxia as any}
		required
	/>

	<RadioGroup
		label="8. Sensory (pinprick test)"
		name="sensory"
		options={[
			{ value: '0', label: '0 - Normal; no sensory loss' },
			{ value: '1', label: '1 - Mild-to-moderate sensory loss' },
			{ value: '2', label: '2 - Severe or total sensory loss' }
		]}
		bind:value={las.sensory as any}
		required
	/>
</SectionCard>
