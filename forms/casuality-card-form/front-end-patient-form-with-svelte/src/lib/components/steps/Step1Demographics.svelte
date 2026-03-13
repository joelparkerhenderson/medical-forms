<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = casualtyCard.data.demographics;
</script>

<SectionCard title="Patient Demographics" description="Patient identification and contact details">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="First Name" name="firstName" bind:value={d.firstName} required />
		<TextInput label="Last Name" name="lastName" bind:value={d.lastName} required />
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Date of Birth" name="dateOfBirth" bind:value={d.dateOfBirth} type="date" required />
		<TextInput label="NHS Number" name="nhsNumber" bind:value={d.nhsNumber} placeholder="000 000 0000" />
	</div>
	<RadioGroup
		label="Sex"
		name="sex"
		bind:value={d.sex}
		options={[
			{ value: 'male', label: 'Male' },
			{ value: 'female', label: 'Female' },
			{ value: 'other', label: 'Other' }
		]}
	/>
	<TextInput label="Address" name="address" bind:value={d.address} />
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Postcode" name="postcode" bind:value={d.postcode} />
		<TextInput label="Phone" name="phone" bind:value={d.phone} type="tel" />
	</div>
	<TextInput label="Email" name="email" bind:value={d.email} type="email" />
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Ethnicity"
			name="ethnicity"
			bind:value={d.ethnicity}
			options={[
				{ value: 'white-british', label: 'White British' },
				{ value: 'white-irish', label: 'White Irish' },
				{ value: 'white-other', label: 'White Other' },
				{ value: 'mixed-white-black-caribbean', label: 'Mixed - White & Black Caribbean' },
				{ value: 'mixed-white-black-african', label: 'Mixed - White & Black African' },
				{ value: 'mixed-white-asian', label: 'Mixed - White & Asian' },
				{ value: 'mixed-other', label: 'Mixed Other' },
				{ value: 'asian-indian', label: 'Asian Indian' },
				{ value: 'asian-pakistani', label: 'Asian Pakistani' },
				{ value: 'asian-bangladeshi', label: 'Asian Bangladeshi' },
				{ value: 'asian-chinese', label: 'Asian Chinese' },
				{ value: 'asian-other', label: 'Asian Other' },
				{ value: 'black-african', label: 'Black African' },
				{ value: 'black-caribbean', label: 'Black Caribbean' },
				{ value: 'black-other', label: 'Black Other' },
				{ value: 'other', label: 'Other' },
				{ value: 'not-stated', label: 'Not Stated' }
			]}
		/>
		<TextInput label="Preferred Language" name="preferredLanguage" bind:value={d.preferredLanguage} />
	</div>
	<RadioGroup
		label="Interpreter Required?"
		name="interpreterRequired"
		bind:value={d.interpreterRequired}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>
</SectionCard>
