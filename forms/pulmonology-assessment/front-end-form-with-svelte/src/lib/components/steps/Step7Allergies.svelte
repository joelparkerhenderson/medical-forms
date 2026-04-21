<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';
</script>

<SectionCard title="Allergies" description="List any known drug allergies">
	<AllergyEntry bind:allergies={assessment.data.allergies} />
	{#if assessment.data.allergies.length === 0}
		<p class="mt-3 text-sm text-gray-500">No allergies added. Click the button above to add one, or proceed to next step if you have none.</p>
	{/if}
</SectionCard>
