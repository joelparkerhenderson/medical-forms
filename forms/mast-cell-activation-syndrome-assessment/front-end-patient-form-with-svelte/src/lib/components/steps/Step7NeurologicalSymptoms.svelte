<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { severityOptions, frequencyOptions } from '$lib/engine/symptom-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import type { SymptomSeverity } from '$lib/engine/types';

	const n = assessment.data.neurologicalSymptoms;

	const symptoms = [
		{ key: 'headache' as const, label: 'Headache', desc: 'Persistent or recurring headaches, migraines' },
		{ key: 'brainFog' as const, label: 'Brain Fog', desc: 'Difficulty concentrating, mental confusion, memory problems' },
		{ key: 'dizziness' as const, label: 'Dizziness', desc: 'Feeling unsteady, vertigo, balance problems' },
		{ key: 'fatigue' as const, label: 'Fatigue', desc: 'Persistent tiredness, exhaustion not relieved by rest' }
	];

	function setSeverity(key: typeof symptoms[number]['key'], value: number) {
		assessment.data.neurologicalSymptoms[key].severity = value as SymptomSeverity;
	}
</script>

<SectionCard title="Neurological Symptoms" description="Rate the severity and frequency of your neurological symptoms">
	{#each symptoms as symptom}
		<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
			<p class="mb-1 text-sm font-medium text-gray-700">{symptom.label}</p>
			<p class="mb-3 text-xs text-gray-400">{symptom.desc}</p>

			<div class="mb-2">
				<p class="mb-2 text-xs font-medium text-gray-600">Severity</p>
				<div class="flex flex-wrap gap-2">
					{#each severityOptions as opt}
						<label
							class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
								{n[symptom.key].severity === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
						>
							<input
								type="radio"
								name="severity-{symptom.key}"
								value={opt.value}
								checked={n[symptom.key].severity === opt.value}
								onchange={() => setSeverity(symptom.key, opt.value)}
								class="text-primary accent-primary"
							/>
							{opt.label}
						</label>
					{/each}
				</div>
			</div>

			<SelectInput
				label="Frequency"
				name="freq-{symptom.key}"
				options={frequencyOptions.map(o => ({ value: o.value, label: o.label }))}
				bind:value={n[symptom.key].frequency}
			/>
		</div>
	{/each}
</SectionCard>
