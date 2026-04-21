<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import type { PreviousSurgery } from '$lib/engine/types';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const sh = assessment.data.surgicalHistory;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	function addSurgery() {
		sh.surgeries = [...sh.surgeries, { procedure: '', date: '', outcome: '' }];
	}

	function removeSurgery(index: number) {
		sh.surgeries = sh.surgeries.filter((_: PreviousSurgery, i: number) => i !== index);
	}
</script>

<SectionCard title="Surgical History" description="Previous orthopedic surgeries and anesthesia history">
	<RadioGroup
		label="Have you had any previous orthopedic surgery?"
		name="previousOrthopedicSurgery"
		options={yesNo}
		bind:value={sh.previousOrthopedicSurgery}
		required
	/>

	{#if sh.previousOrthopedicSurgery === 'yes'}
		<div class="mt-4 space-y-3">
			{#each sh.surgeries as surgery, i}
				<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
					<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
						<input
							type="text"
							placeholder="Procedure"
							bind:value={surgery.procedure}
							class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
						<input
							type="date"
							placeholder="Date"
							bind:value={surgery.date}
							class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
						<input
							type="text"
							placeholder="Outcome"
							bind:value={surgery.outcome}
							class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
					</div>
					<button
						type="button"
						onclick={() => removeSurgery(i)}
						class="mt-1 text-red-500 hover:text-red-700"
						aria-label="Remove surgery"
					>
						&times;
					</button>
				</div>
			{/each}

			<button
				type="button"
				onclick={addSurgery}
				class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
			>
				+ Add Surgery
			</button>
		</div>
	{/if}

	<div class="mt-6">
		<RadioGroup
			label="Have you had any complications with anesthesia?"
			name="anesthesiaComplications"
			options={yesNo}
			bind:value={sh.anesthesiaComplications}
		/>
		{#if sh.anesthesiaComplications === 'yes'}
			<TextArea
				label="Anesthesia Complication Details"
				name="anesthesiaDetails"
				bind:value={sh.anesthesiaDetails}
				placeholder="Describe the complications..."
			/>
		{/if}
	</div>

	<div class="mt-4">
		<RadioGroup
			label="Would you be willing to consider surgery if recommended?"
			name="willingToConsiderSurgery"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' },
				{ value: 'undecided', label: 'Undecided' }
			]}
			bind:value={sh.willingToConsiderSurgery}
		/>
	</div>
</SectionCard>
