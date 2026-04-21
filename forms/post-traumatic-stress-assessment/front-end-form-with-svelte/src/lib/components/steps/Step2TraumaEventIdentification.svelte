<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const t = assessment.data.traumaEvent;
</script>

<SectionCard title="Trauma Event Identification" description="The PCL-5 must be anchored to a specific traumatic event (DSM-5 Criterion A). Please briefly describe the worst event you have experienced.">
	<TextArea label="Event description (keep brief — you don't need to describe it in detail)" name="eventDescription" bind:value={t.eventDescription} rows={3} />
	<TextInput label="Event date (approximate is fine)" name="eventDate" bind:value={t.eventDate} type="date" />
	<label class="mt-2 flex cursor-pointer items-center gap-2 text-sm">
		<input type="checkbox" bind:checked={t.isOngoing} class="accent-primary" />
		<span>The event or situation is still happening</span>
	</label>

	<p class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
		<strong>Following questions refer to this event.</strong> Please answer based on how much you have been bothered by each problem <em>in the past month</em>.
	</p>
</SectionCard>
