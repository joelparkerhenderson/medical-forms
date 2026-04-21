<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const nok = casualtyCard.data.nextOfKinGP.nextOfKin;
	const gp = casualtyCard.data.nextOfKinGP.gp;
</script>

<SectionCard title="Next of Kin & GP" description="Emergency contact and GP details">
	<h3 class="mb-3 text-lg font-semibold text-gray-800">Next of Kin</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Name" name="nokName" bind:value={nok.name} />
		<TextInput label="Relationship" name="nokRelationship" bind:value={nok.relationship} />
	</div>
	<TextInput label="Phone" name="nokPhone" bind:value={nok.phone} type="tel" />
	<RadioGroup
		label="Next of Kin Notified?"
		name="nokNotified"
		bind:value={nok.notified}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">General Practitioner</h3>
	<TextInput label="GP Name" name="gpName" bind:value={gp.name} />
	<TextInput label="Practice Name" name="gpPracticeName" bind:value={gp.practiceName} />
	<TextInput label="Practice Address" name="gpPracticeAddress" bind:value={gp.practiceAddress} />
	<TextInput label="Practice Phone" name="gpPracticePhone" bind:value={gp.practicePhone} type="tel" />
</SectionCard>
