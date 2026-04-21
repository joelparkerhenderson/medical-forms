<script lang="ts">
	let { label, name, options, value = $bindable('') }: { label: string; name: string; options: { value: string; label: string }[]; value: string; } = $props();
</script>

<div class="mb-4">
	<span class="mb-1 block text-sm font-medium text-gray-700">{label}</span>
	<div class="flex flex-wrap gap-2">
		{#each options as opt (opt.value)}
			<label class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm {value === opt.value ? 'border-primary bg-blue-50 text-primary' : 'border-gray-300 text-gray-700'}">
				<input type="radio" {name} value={opt.value} bind:group={value} class="sr-only" />
				{opt.label}
			</label>
		{/each}
	</div>
</div>
