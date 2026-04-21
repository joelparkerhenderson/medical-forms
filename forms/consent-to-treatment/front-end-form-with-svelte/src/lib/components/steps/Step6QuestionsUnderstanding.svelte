<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const q = assessment.data.questionsUnderstanding;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Questions & Understanding" description="Confirm patient understanding and record any questions">
	<TextArea
		label="Questions Asked by Patient"
		name="questionsAsked"
		bind:value={q.questionsAsked}
		placeholder="Record any questions the patient has asked..."
		rows={3}
	/>

	<RadioGroup
		label="Patient understands the procedure"
		name="understandsProcedure"
		options={yesNoOptions}
		bind:value={q.understandsProcedure}
		required
	/>

	<RadioGroup
		label="Patient understands the risks"
		name="understandsRisks"
		options={yesNoOptions}
		bind:value={q.understandsRisks}
		required
	/>

	<RadioGroup
		label="Patient understands the alternatives"
		name="understandsAlternatives"
		options={yesNoOptions}
		bind:value={q.understandsAlternatives}
		required
	/>

	<RadioGroup
		label="Patient understands the recovery process"
		name="understandsRecovery"
		options={yesNoOptions}
		bind:value={q.understandsRecovery}
		required
	/>

	<TextArea
		label="Additional Concerns"
		name="additionalConcerns"
		bind:value={q.additionalConcerns}
		placeholder="Record any additional concerns raised by the patient..."
		rows={3}
	/>
</SectionCard>
