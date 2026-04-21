<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';
</script>

<SectionCard title="Current Medications" description="Eye drops, oral medications for eyes, and ophthalmic drug allergies">
	<h3 class="mb-3 font-semibold text-gray-800">Eye Drops</h3>
	<MedicationEntry bind:medications={assessment.data.currentMedications.eyeDrops} />
	{#if assessment.data.currentMedications.eyeDrops.length === 0}
		<p class="mt-3 text-sm text-gray-500">No eye drops added. Click above to add, or proceed if none.</p>
	{/if}

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Oral Medications for Eyes</h3>
	<MedicationEntry bind:medications={assessment.data.currentMedications.oralMedications} />
	{#if assessment.data.currentMedications.oralMedications.length === 0}
		<p class="mt-3 text-sm text-gray-500">No oral medications added. Click above to add, or proceed if none.</p>
	{/if}

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Ophthalmic Drug Allergies</h3>
	<AllergyEntry bind:allergies={assessment.data.currentMedications.ophthalmicDrugAllergies} />
	{#if assessment.data.currentMedications.ophthalmicDrugAllergies.length === 0}
		<p class="mt-3 text-sm text-gray-500">No drug allergies added. Click above to add, or proceed if none.</p>
	{/if}
</SectionCard>
