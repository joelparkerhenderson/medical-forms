<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ca = assessment.data.contraindicationsAllergies;
</script>

<SectionCard title="Contraindications & Allergies" description="Screen for contraindications and allergies that may affect vaccination.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup label="Egg allergy?" name="eggAllergy" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={ca.eggAllergy} />
		<RadioGroup label="Gelatin allergy?" name="gelatinAllergy" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={ca.gelatinAllergy} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup label="Latex allergy?" name="latexAllergy" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={ca.latexAllergy} />
		<RadioGroup label="Neomycin allergy?" name="neomycinAllergy" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={ca.neomycinAllergy} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Is the patient pregnant?"
			name="pregnant"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' },
				{ value: 'notApplicable', label: 'N/A' }
			]}
			bind:value={ca.pregnant}
		/>
		<TextInput label="If pregnant, weeks gestation" name="pregnancyWeeks" bind:value={ca.pregnancyWeeks} placeholder="e.g. 28" />
	</div>

	<RadioGroup label="Currently has severe illness?" name="severeIllness" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={ca.severeIllness} />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup label="Previous anaphylaxis to any vaccine?" name="previousAnaphylaxis" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={ca.previousAnaphylaxis} />
		<TextArea label="If yes, please describe" name="anaphylaxisDetails" bind:value={ca.anaphylaxisDetails} placeholder="Describe the anaphylactic reaction..." />
	</div>
</SectionCard>
