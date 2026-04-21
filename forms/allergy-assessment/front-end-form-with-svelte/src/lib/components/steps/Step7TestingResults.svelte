<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const t = assessment.data.testingResults;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	function addTestResult() {
		t.testResults = [...t.testResults, { testType: '', allergen: '', result: '' }];
	}

	function removeTestResult(index: number) {
		t.testResults = t.testResults.filter((_, i) => i !== index);
	}
</script>

<SectionCard title="Testing Results" description="Skin prick tests, IgE levels, challenge tests, and patch tests">
	<RadioGroup label="Skin prick tests done?" name="skinPrick" options={yesNo} bind:value={t.skinPrickTestsDone} />
	<RadioGroup label="Specific IgE levels done?" name="specificIgE" options={yesNo} bind:value={t.specificIgEDone} />
	<RadioGroup label="Component-resolved diagnostics done?" name="crd" options={yesNo} bind:value={t.componentResolvedDiagnosticsDone} />
	<RadioGroup label="Challenge tests done?" name="challenge" options={yesNo} bind:value={t.challengeTestsDone} />
	<RadioGroup label="Patch tests done?" name="patch" options={yesNo} bind:value={t.patchTestsDone} />

	<div class="mb-4">
		<label class="mb-2 block text-sm font-medium text-gray-700">Test results</label>
		<div class="space-y-3">
			{#each t.testResults as result, i}
				<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
					<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
						<input
							type="text"
							placeholder="Test type"
							bind:value={result.testType}
							class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
						<input
							type="text"
							placeholder="Allergen"
							bind:value={result.allergen}
							class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
						<input
							type="text"
							placeholder="Result"
							bind:value={result.result}
							class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
					</div>
					<button
						type="button"
						onclick={() => removeTestResult(i)}
						class="mt-1 text-red-500 hover:text-red-700"
						aria-label="Remove test result"
					>
						&times;
					</button>
				</div>
			{/each}

			<button
				type="button"
				onclick={addTestResult}
				class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
			>
				+ Add Test Result
			</button>
		</div>
	</div>
</SectionCard>
