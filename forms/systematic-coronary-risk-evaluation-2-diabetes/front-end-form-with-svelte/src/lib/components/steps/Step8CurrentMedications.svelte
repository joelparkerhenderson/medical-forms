<script lang="ts">
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { CurrentMedications } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: CurrentMedications } = $props();

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications">
	<p class="mb-4 text-sm text-gray-500">
		Indicate whether the patient is currently taking any of the following medications.
	</p>

	<h4 class="mt-2 mb-2 text-sm font-semibold text-gray-700">Diabetes Medications</h4>

	<RadioGroup label="Metformin" name="metformin" options={yesNo} bind:value={data.metformin} />
	<RadioGroup label="SGLT2 Inhibitor" name="sglt2Inhibitor" options={yesNo} bind:value={data.sglt2Inhibitor} hint="e.g. Dapagliflozin, Empagliflozin, Canagliflozin" />
	<RadioGroup label="GLP-1 Receptor Agonist" name="glp1Agonist" options={yesNo} bind:value={data.glp1Agonist} hint="e.g. Liraglutide, Semaglutide, Dulaglutide" />
	<RadioGroup label="Sulfonylurea" name="sulfonylurea" options={yesNo} bind:value={data.sulfonylurea} hint="e.g. Gliclazide, Glimepiride" />
	<RadioGroup label="DPP-4 Inhibitor" name="dpp4Inhibitor" options={yesNo} bind:value={data.dpp4Inhibitor} hint="e.g. Sitagliptin, Linagliptin, Saxagliptin" />
	<RadioGroup label="Insulin" name="insulin" options={yesNo} bind:value={data.insulin} />

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Cardiovascular Medications</h4>

	<RadioGroup label="ACE Inhibitor or ARB" name="aceInhibitorOrArb" options={yesNo} bind:value={data.aceInhibitorOrArb} hint="e.g. Ramipril, Lisinopril, Losartan, Candesartan" />
	<RadioGroup label="Antiplatelet Agent" name="antiplatelet" options={yesNo} bind:value={data.antiplatelet} hint="e.g. Aspirin, Clopidogrel" />
	<RadioGroup label="Anticoagulant" name="anticoagulant" options={yesNo} bind:value={data.anticoagulant} hint="e.g. Warfarin, Apixaban, Rivaroxaban, Edoxaban" />

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Other Medications</h4>

	<div class="mb-4">
		<label for="otherMedications" class="block text-sm font-medium text-gray-700 mb-1">Other Medications</label>
		<textarea
			id="otherMedications"
			bind:value={data.otherMedications}
			placeholder="List any other medications not covered above, including dose and frequency"
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			rows="3"
		></textarea>
	</div>
</SectionCard>
