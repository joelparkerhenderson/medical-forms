<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';

	const cm = assessment.data.currentMedications;
</script>

<SectionCard title="Current Medications" description="All medications, supplements, and allergies">
	<div class="space-y-6">
		<div>
			<h3 class="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Prescriptions</h3>
			<MedicationEntry bind:medications={cm.prescriptions} />
			{#if cm.prescriptions.length === 0}
				<p class="mt-2 text-sm text-gray-500">No prescriptions added.</p>
			{/if}
		</div>

		<div>
			<h3 class="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Over-the-Counter Medications</h3>
			<MedicationEntry bind:medications={cm.otcMedications} />
			{#if cm.otcMedications.length === 0}
				<p class="mt-2 text-sm text-gray-500">No OTC medications added.</p>
			{/if}
		</div>

		<div>
			<h3 class="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Supplements</h3>
			<MedicationEntry bind:medications={cm.supplements} />
			{#if cm.supplements.length === 0}
				<p class="mt-2 text-sm text-gray-500">No supplements added.</p>
			{/if}
		</div>

		<hr class="border-gray-200" />

		<div>
			<h3 class="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Allergies</h3>
			<AllergyEntry bind:allergies={cm.allergies} />
			{#if cm.allergies.length === 0}
				<p class="mt-2 text-sm text-gray-500">No allergies added. Proceed to next step if there are none.</p>
			{/if}
		</div>
	</div>
</SectionCard>
