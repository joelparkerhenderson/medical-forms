<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const a = assessment.data.anaphylaxisHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	function addEpisode() {
		a.episodes = [...a.episodes, { trigger: '', symptoms: '', treatmentRequired: '' }];
	}

	function removeEpisode(index: number) {
		a.episodes = a.episodes.filter((_, i) => i !== index);
	}
</script>

<SectionCard title="Anaphylaxis History" description="Previous anaphylaxis episodes, triggers, and emergency preparedness">
	<RadioGroup label="Do you have a history of anaphylaxis?" name="hasAnaphylaxis" options={yesNo} bind:value={a.hasAnaphylaxisHistory} />

	{#if a.hasAnaphylaxisHistory === 'yes'}
		<NumberInput label="Number of episodes" name="numEpisodes" bind:value={a.numberOfEpisodes} min={1} max={100} required />

		<div class="mb-4">
			<label class="mb-2 block text-sm font-medium text-gray-700">Episode details</label>
			<div class="space-y-3">
				{#each a.episodes as episode, i}
					<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
						<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
							<input
								type="text"
								placeholder="Trigger"
								bind:value={episode.trigger}
								class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
							/>
							<input
								type="text"
								placeholder="Symptoms"
								bind:value={episode.symptoms}
								class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
							/>
							<input
								type="text"
								placeholder="Treatment required"
								bind:value={episode.treatmentRequired}
								class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
							/>
						</div>
						<button
							type="button"
							onclick={() => removeEpisode(i)}
							class="mt-1 text-red-500 hover:text-red-700"
							aria-label="Remove episode"
						>
							&times;
						</button>
					</div>
				{/each}

				<button
					type="button"
					onclick={addEpisode}
					class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
				>
					+ Add Episode
				</button>
			</div>
		</div>

		<RadioGroup label="Has an adrenaline auto-injector been prescribed?" name="autoInjector" options={yesNo} bind:value={a.adrenalineAutoInjectorPrescribed} />
		<RadioGroup label="Is an action plan in place?" name="actionPlan" options={yesNo} bind:value={a.actionPlanInPlace} />
	{/if}
</SectionCard>
