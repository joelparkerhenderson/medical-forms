<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const e = assessment.data.environmentalFactors;
</script>

<SectionCard title="Environmental Factors" description="Describe the environments where you live, work, and participate in the community">
	<TextArea
		label="Home Environment"
		name="homeEnvironment"
		bind:value={e.homeEnvironment}
		placeholder="Describe your home setup, accessibility, any barriers or hazards (e.g., stairs, bathroom access, doorway width)..."
		rows={3}
	/>

	<TextArea
		label="Work/School Environment"
		name="workEnvironment"
		bind:value={e.workEnvironment}
		placeholder="Describe your workplace/school setup, accessibility, ergonomics..."
		rows={3}
	/>

	<TextArea
		label="Community Access"
		name="communityAccess"
		bind:value={e.communityAccess}
		placeholder="Describe your access to community resources, transportation, shops, healthcare..."
		rows={3}
	/>

	<TextArea
		label="Assistive Devices"
		name="assistiveDevices"
		bind:value={e.assistiveDevices}
		placeholder="List any assistive devices currently used or needed (e.g., wheelchair, walker, grab bars, shower chair)..."
		rows={3}
	/>

	<TextArea
		label="Social Support"
		name="socialSupport"
		bind:value={e.socialSupport}
		placeholder="Describe available social support (family, friends, carers, community services)..."
		rows={3}
	/>
</SectionCard>
