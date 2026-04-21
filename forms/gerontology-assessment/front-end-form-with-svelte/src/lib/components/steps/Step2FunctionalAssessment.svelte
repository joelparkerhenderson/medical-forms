<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const f = assessment.data.functionalAssessment;

	const adlOptions = [
		{ value: 'independent', label: 'Independent' },
		{ value: 'needs-assistance', label: 'Needs Assistance' },
		{ value: 'dependent', label: 'Dependent' }
	];
</script>

<SectionCard title="Functional Assessment" description="Activities of Daily Living (ADLs) and Instrumental Activities of Daily Living (IADLs)">
	<h3 class="mb-3 text-sm font-semibold text-gray-800 uppercase tracking-wide">Basic ADLs</h3>

	<SelectInput label="Bathing" name="bathingADL" options={adlOptions} bind:value={f.bathingADL} required />
	<SelectInput label="Dressing" name="dressingADL" options={adlOptions} bind:value={f.dressingADL} required />
	<SelectInput label="Toileting" name="toiletingADL" options={adlOptions} bind:value={f.toiletingADL} required />
	<SelectInput label="Transferring" name="transferringADL" options={adlOptions} bind:value={f.transferringADL} required />
	<SelectInput label="Feeding" name="feedingADL" options={adlOptions} bind:value={f.feedingADL} required />

	<hr class="my-4 border-gray-200" />

	<h3 class="mb-3 text-sm font-semibold text-gray-800 uppercase tracking-wide">Instrumental ADLs</h3>

	<SelectInput label="Cooking" name="cookingIADL" options={adlOptions} bind:value={f.cookingIADL} required />
	<SelectInput label="Cleaning" name="cleaningIADL" options={adlOptions} bind:value={f.cleaningIADL} required />
	<SelectInput label="Shopping" name="shoppingIADL" options={adlOptions} bind:value={f.shoppingIADL} required />
	<SelectInput label="Managing Finances" name="financesIADL" options={adlOptions} bind:value={f.financesIADL} required />
	<SelectInput label="Medication Management" name="medicationManagementIADL" options={adlOptions} bind:value={f.medicationManagementIADL} required />
</SectionCard>
