<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const c = assessment.data.communicationPreferences;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Communication Preferences" description="How you prefer to communicate and be communicated with">
	<TextInput
		label="Preferred language"
		name="preferredLanguage"
		bind:value={c.preferredLanguage}
		placeholder="e.g. English, Welsh, Urdu..."
	/>

	<TextArea
		label="Communication aids"
		name="communicationAids"
		bind:value={c.communicationAids}
		placeholder="e.g. Hearing aid, reading glasses, communication board, large print..."
		rows={3}
	/>

	<TextInput
		label="How would you like to be addressed?"
		name="howToBeAddressed"
		bind:value={c.howToBeAddressed}
		placeholder="e.g. Jane, Mrs Smith, Dr Jones..."
	/>

	<TextArea
		label="Information sharing preferences"
		name="informationSharingPreferences"
		bind:value={c.informationSharingPreferences}
		placeholder="Who should be told about your condition? Are there things you do or do not want to be told?"
		rows={4}
	/>

	<RadioGroup
		label="Do you need an interpreter?"
		name="interpreterNeeded"
		options={yesNo}
		bind:value={c.interpreterNeeded}
	/>
	{#if c.interpreterNeeded === 'yes'}
		<TextInput
			label="Interpreter language"
			name="interpreterLanguage"
			bind:value={c.interpreterLanguage}
			placeholder="Which language?"
		/>
	{/if}
</SectionCard>
