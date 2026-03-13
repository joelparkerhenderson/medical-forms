<script lang="ts">
	import type { Allergy, AllergySeverity } from '$lib/engine/types';

	let {
		allergies = $bindable<Allergy[]>([])
	}: {
		allergies: Allergy[];
	} = $props();

	const severityOptions: { value: AllergySeverity; label: string }[] = [
		{ value: 'mild', label: 'Mild' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'anaphylaxis', label: 'Anaphylaxis' }
	];

	function addAllergy() {
		allergies = [...allergies, { allergen: '', reaction: '', severity: '' }];
	}

	function removeAllergy(index: number) {
		allergies = allergies.filter((_, i) => i !== index);
	}
</script>

<div class="space-y-3">
	{#each allergies as allergy, i}
		<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
			<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
				<input
					type="text"
					placeholder="Allergen"
					bind:value={allergy.allergen}
					class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
				/>
				<input
					type="text"
					placeholder="Reaction"
					bind:value={allergy.reaction}
					class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
				/>
				<select
					bind:value={allergy.severity}
					class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
				>
					<option value="">Severity</option>
					{#each severityOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>
			<button
				type="button"
				onclick={() => removeAllergy(i)}
				class="mt-1 text-red-500 hover:text-red-700"
				aria-label="Remove allergy"
			>
				&times;
			</button>
		</div>
	{/each}

	<button
		type="button"
		onclick={addAllergy}
		class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
	>
		+ Add Allergy
	</button>
</div>
