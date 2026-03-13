<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const pc = assessment.data.physicalCognitiveStatus;
</script>

<SectionCard title="Physical & Cognitive Status" description="Current physical and cognitive abilities relevant to occupational performance">
	<TextArea
		label="Upper Extremity Function"
		name="upperExtremity"
		bind:value={pc.upperExtremity}
		placeholder="Describe upper extremity strength, range of motion, fine motor skills..."
		rows={2}
	/>

	<TextArea
		label="Lower Extremity Function"
		name="lowerExtremity"
		bind:value={pc.lowerExtremity}
		placeholder="Describe lower extremity strength, range of motion, weight-bearing status..."
		rows={2}
	/>

	<TextArea
		label="Coordination"
		name="coordination"
		bind:value={pc.coordination}
		placeholder="Describe gross and fine motor coordination, balance..."
		rows={2}
	/>

	<TextArea
		label="Cognition"
		name="cognition"
		bind:value={pc.cognition}
		placeholder="Describe cognitive function: memory, attention, problem-solving, orientation..."
		rows={2}
	/>

	<TextArea
		label="Vision"
		name="vision"
		bind:value={pc.vision}
		placeholder="Describe visual function, any impairments, use of corrective lenses..."
		rows={2}
	/>

	<TextArea
		label="Fatigue"
		name="fatigue"
		bind:value={pc.fatigue}
		placeholder="Describe fatigue levels, impact on daily activities, patterns..."
		rows={2}
	/>

	<TextArea
		label="Pain"
		name="pain"
		bind:value={pc.pain}
		placeholder="Describe pain: location, intensity, frequency, impact on function..."
		rows={2}
	/>
</SectionCard>
