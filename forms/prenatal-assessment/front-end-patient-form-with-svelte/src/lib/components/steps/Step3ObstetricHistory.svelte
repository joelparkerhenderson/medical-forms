<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const o = assessment.data.obstetricHistory;
	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Obstetric History" description="Previous pregnancies and complications">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Gravida (total pregnancies)" name="gravida" bind:value={o.gravida} min={0} max={20} required />
		<NumberInput label="Para (births after 24 weeks)" name="para" bind:value={o.para} min={0} max={20} required />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Abortions / Miscarriages" name="abortions" bind:value={o.abortions} min={0} max={20} />
		<NumberInput label="Living Children" name="livingChildren" bind:value={o.livingChildren} min={0} max={20} />
	</div>

	<div class="mt-4 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Previous Complications</h3>

		<RadioGroup
			label="Previous preeclampsia"
			name="prevPreeclampsia"
			options={yesNoOptions}
			bind:value={o.previousComplications.preeclampsia}
		/>

		<RadioGroup
			label="Previous gestational diabetes"
			name="prevGDM"
			options={yesNoOptions}
			bind:value={o.previousComplications.gestationalDiabetes}
		/>

		<RadioGroup
			label="Previous preterm birth (before 37 weeks)"
			name="prevPreterm"
			options={yesNoOptions}
			bind:value={o.previousComplications.pretermBirth}
		/>

		<RadioGroup
			label="Previous cesarean section"
			name="prevCesarean"
			options={yesNoOptions}
			bind:value={o.previousComplications.cesareanSection}
		/>
	</div>
</SectionCard>
