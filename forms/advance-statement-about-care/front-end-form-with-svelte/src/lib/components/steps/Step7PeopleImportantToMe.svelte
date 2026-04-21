<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import type { PersonImportantToMe } from '$lib/engine/types';

	const p = assessment.data.peopleImportantToMe;

	function addPerson() {
		assessment.data.peopleImportantToMe.people = [
			...p.people,
			{ name: '', relationship: '', telephone: '', email: '', role: '' }
		];
	}

	function removePerson(index: number) {
		assessment.data.peopleImportantToMe.people = p.people.filter((_, i) => i !== index);
	}
</script>

<SectionCard title="People Important to Me" description="Family, friends, and others who are important in your life and care">
	<div class="space-y-4">
		{#each p.people as person, i}
			<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-medium text-gray-700">Person {i + 1}</span>
					<button
						type="button"
						onclick={() => removePerson(i)}
						class="text-sm text-red-500 hover:text-red-700"
						aria-label="Remove person"
					>
						Remove
					</button>
				</div>
				<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
					<div class="mb-3">
						<label for="personName-{i}" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
						<input
							id="personName-{i}"
							type="text"
							bind:value={person.name}
							placeholder="Full name"
							class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
					</div>
					<div class="mb-3">
						<label for="personRelation-{i}" class="mb-1 block text-sm font-medium text-gray-700">Relationship</label>
						<input
							id="personRelation-{i}"
							type="text"
							bind:value={person.relationship}
							placeholder="e.g. Daughter, Friend, Vicar"
							class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
					</div>
					<div class="mb-3">
						<label for="personTel-{i}" class="mb-1 block text-sm font-medium text-gray-700">Telephone</label>
						<input
							id="personTel-{i}"
							type="text"
							bind:value={person.telephone}
							placeholder="Contact number"
							class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
					</div>
					<div class="mb-3">
						<label for="personEmail-{i}" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
						<input
							id="personEmail-{i}"
							type="text"
							bind:value={person.email}
							placeholder="Email address"
							class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
					</div>
				</div>
				<div class="mb-1">
					<label for="personRole-{i}" class="mb-1 block text-sm font-medium text-gray-700">Role in your care</label>
					<input
						id="personRole-{i}"
						type="text"
						bind:value={person.role}
						placeholder="e.g. Main contact for care decisions, spiritual support, to be informed"
						class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
					/>
				</div>
			</div>
		{/each}

		<button
			type="button"
			onclick={addPerson}
			class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
		>
			+ Add Person
		</button>

		{#if p.people.length === 0}
			<p class="text-sm text-gray-500">No people added yet. Click the button above to add someone important to you.</p>
		{/if}
	</div>

	<div class="mt-6 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Pets</h3>
		<TextArea
			label="Details of any pets"
			name="petsDetails"
			bind:value={p.petsDetails}
			placeholder="e.g. Labrador called Rosie, 5 years old..."
			rows={2}
		/>
		<TextArea
			label="Pet care arrangements"
			name="petCareArrangements"
			bind:value={p.petCareArrangements}
			placeholder="Who will care for your pets if you are unable to?"
			rows={2}
		/>
	</div>
</SectionCard>
