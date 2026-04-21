<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.medicalTreatmentWishes;
</script>

<SectionCard title="Medical Treatment Wishes" description="Your preferences about medical treatments. Note: these are wishes, not legally binding refusals (which require an Advance Decision to Refuse Treatment / ADRT).">
	<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
		<strong>Important:</strong> An advance statement records your wishes and preferences but is
		not the same as an Advance Decision to Refuse Treatment (ADRT), which is legally binding under
		the Mental Capacity Act 2005. Your care team must take these wishes into account but they are
		not legally obliged to follow them.
	</div>

	<TextArea
		label="Pain management preferences"
		name="painManagementPreferences"
		bind:value={m.painManagementPreferences}
		placeholder="e.g. I wish to be kept comfortable and pain-free, even if this may shorten my life..."
		rows={4}
	/>

	<TextArea
		label="Nutrition and hydration wishes"
		name="nutritionHydrationWishes"
		bind:value={m.nutritionHydrationWishes}
		placeholder="Your wishes about eating, drinking, and artificial nutrition/hydration..."
		rows={4}
	/>

	<TextArea
		label="Ventilation wishes"
		name="ventilationWishes"
		bind:value={m.ventilationWishes}
		placeholder="Your wishes about mechanical ventilation or breathing support..."
		rows={4}
	/>

	<TextArea
		label="Resuscitation wishes"
		name="resuscitationWishes"
		bind:value={m.resuscitationWishes}
		placeholder="Your wishes about CPR and resuscitation attempts. Remember: this is an expression of wishes, not a legally binding DNACPR order..."
		rows={4}
	/>

	<TextArea
		label="Antibiotics wishes"
		name="antibioticsWishes"
		bind:value={m.antibioticsWishes}
		placeholder="Your wishes about antibiotic treatment, e.g. for comfort only vs. to treat infections..."
		rows={3}
	/>

	<TextArea
		label="Hospitalisation wishes"
		name="hospitalisationWishes"
		bind:value={m.hospitalisationWishes}
		placeholder="Your preferences about being admitted to hospital..."
		rows={3}
	/>

	<TextArea
		label="Blood transfusion wishes"
		name="bloodTransfusionWishes"
		bind:value={m.bloodTransfusionWishes}
		placeholder="Your wishes about receiving blood transfusions..."
		rows={3}
	/>

	<TextArea
		label="Organ donation wishes"
		name="organDonationWishes"
		bind:value={m.organDonationWishes}
		placeholder="Your wishes about organ donation..."
		rows={3}
	/>
</SectionCard>
