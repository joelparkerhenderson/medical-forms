<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const d = assessment.data.transfusionHistory;
</script>

<SectionCard title="Transfusion History" description="Document the patient's transfusion history and blood group information">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Previous Transfusions"
			name="previousTransfusions"
			bind:value={d.previousTransfusions}
			options={[
				{ value: 'none', label: 'None' },
				{ value: '1to5', label: '1-5 transfusions' },
				{ value: '6to20', label: '6-20 transfusions' },
				{ value: 'moreThan20', label: 'More than 20 transfusions' },
				{ value: 'chronicDependent', label: 'Chronic transfusion-dependent' }
			]}
		/>
		<SelectInput
			label="Transfusion Reactions"
			name="transfusionReactions"
			bind:value={d.transfusionReactions}
			options={[
				{ value: 'none', label: 'None' },
				{ value: 'febrile', label: 'Febrile non-hemolytic' },
				{ value: 'allergic', label: 'Allergic' },
				{ value: 'hemolytic', label: 'Hemolytic' },
				{ value: 'trali', label: 'TRALI' },
				{ value: 'other', label: 'Other' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Blood Group & Type"
			name="bloodGroupType"
			bind:value={d.bloodGroupType}
			options={[
				{ value: 'aPositive', label: 'A Positive' },
				{ value: 'aNegative', label: 'A Negative' },
				{ value: 'bPositive', label: 'B Positive' },
				{ value: 'bNegative', label: 'B Negative' },
				{ value: 'abPositive', label: 'AB Positive' },
				{ value: 'abNegative', label: 'AB Negative' },
				{ value: 'oPositive', label: 'O Positive' },
				{ value: 'oNegative', label: 'O Negative' }
			]}
		/>
		<SelectInput
			label="Antibody Screen"
			name="antibodyScreen"
			bind:value={d.antibodyScreen}
			options={[
				{ value: 'negative', label: 'Negative' },
				{ value: 'positive', label: 'Positive' },
				{ value: 'notPerformed', label: 'Not Performed' }
			]}
		/>
	</div>

	<TextArea label="Crossmatch Results" name="crossmatchResults" rows={2} bind:value={d.crossmatchResults} placeholder="e.g. Compatible, no irregularities" />
</SectionCard>
