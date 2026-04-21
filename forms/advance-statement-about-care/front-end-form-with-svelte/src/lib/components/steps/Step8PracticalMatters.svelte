<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const pm = assessment.data.practicalMatters;
</script>

<SectionCard title="Practical Matters" description="Practical arrangements and wishes for your affairs">
	<TextArea
		label="Financial arrangements"
		name="financialArrangements"
		bind:value={pm.financialArrangements}
		placeholder="e.g. Who manages your finances? Bank details location, direct debits..."
		rows={3}
	/>

	<TextArea
		label="Property matters"
		name="propertyMatters"
		bind:value={pm.propertyMatters}
		placeholder="e.g. Ownership details, mortgage, keys location..."
		rows={3}
	/>

	<TextArea
		label="Pet care instructions"
		name="petCareInstructions"
		bind:value={pm.petCareInstructions}
		placeholder="Detailed instructions for ongoing pet care..."
		rows={3}
	/>

	<TextArea
		label="Social media wishes"
		name="socialMediaWishes"
		bind:value={pm.socialMediaWishes}
		placeholder="What should happen to your social media accounts?"
		rows={2}
	/>

	<TextArea
		label="Personal belongings"
		name="personalBelongings"
		bind:value={pm.personalBelongings}
		placeholder="Any specific wishes about personal items, keepsakes, or belongings..."
		rows={3}
	/>

	<TextArea
		label="Funeral wishes"
		name="funeralWishes"
		bind:value={pm.funeralWishes}
		placeholder="Your preferences for funeral arrangements, burial vs cremation, service details..."
		rows={4}
	/>

	<TextArea
		label="Will details"
		name="willDetails"
		bind:value={pm.willDetails}
		placeholder="Where is your will held? Who is the executor? Solicitor details..."
		rows={3}
	/>

	<TextArea
		label="Power of Attorney details"
		name="powerOfAttorneyDetails"
		bind:value={pm.powerOfAttorneyDetails}
		placeholder="Details of any Lasting Power of Attorney (health and welfare, or property and financial affairs)..."
		rows={4}
	/>
</SectionCard>
