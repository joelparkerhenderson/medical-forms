<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const r = assessment.data.patientRights;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Patient Rights" description="Confirm understanding and acknowledgement of patient rights">
	<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<p class="font-medium">Please confirm the following patient rights have been discussed:</p>
	</div>

	<RadioGroup
		label="Patient understands they have the right to withdraw consent at any time"
		name="rightToWithdraw"
		options={yesNoOptions}
		bind:value={r.rightToWithdraw}
		required
	/>

	<RadioGroup
		label="Patient understands they have the right to seek a second opinion"
		name="rightToSecondOpinion"
		options={yesNoOptions}
		bind:value={r.rightToSecondOpinion}
		required
	/>

	<RadioGroup
		label="Patient confirms consent is given voluntarily and without coercion"
		name="informedVoluntarily"
		options={yesNoOptions}
		bind:value={r.informedVoluntarily}
		required
	/>

	<RadioGroup
		label="Patient acknowledges that no guarantee of outcome has been made"
		name="noGuaranteeAcknowledged"
		options={yesNoOptions}
		bind:value={r.noGuaranteeAcknowledged}
		required
	/>
</SectionCard>
