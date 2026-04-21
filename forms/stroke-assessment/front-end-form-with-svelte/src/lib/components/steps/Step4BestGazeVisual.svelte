<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const gv = assessment.data.bestGazeVisual;
</script>

<SectionCard title="Best Gaze & Visual" description="NIHSS Items 2 and 3">
	<RadioGroup
		label="2. Best Gaze (horizontal eye movements)"
		name="bestGaze"
		options={[
			{ value: '0', label: '0 - Normal' },
			{ value: '1', label: '1 - Partial gaze palsy' },
			{ value: '2', label: '2 - Forced deviation or total gaze paresis' }
		]}
		bind:value={gv.bestGaze as any}
		required
	/>

	<RadioGroup
		label="3. Visual Fields"
		name="visual"
		options={[
			{ value: '0', label: '0 - No visual loss' },
			{ value: '1', label: '1 - Partial hemianopia' },
			{ value: '2', label: '2 - Complete hemianopia' },
			{ value: '3', label: '3 - Bilateral hemianopia (blind)' }
		]}
		bind:value={gv.visual as any}
		required
	/>
</SectionCard>
