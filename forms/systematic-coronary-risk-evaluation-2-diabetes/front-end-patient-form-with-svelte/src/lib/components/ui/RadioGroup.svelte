<script lang="ts">
	let {
		label,
		name,
		options,
		value = $bindable(''),
		hint = ''
	}: {
		label: string;
		name: string;
		options: { value: string; label: string }[];
		value: string;
		hint?: string;
	} = $props();
</script>

<div class="mb-4">
	<span class="block text-sm font-medium text-gray-700 mb-1">{label}</span>
	{#if hint}
		<p class="text-xs text-gray-500 mb-1">{hint}</p>
	{/if}
	<div class="flex flex-wrap gap-4">
		{#each options as opt}
			<label class="inline-flex items-center gap-2 text-sm">
				<input
					type="radio"
					{name}
					value={opt.value}
					bind:group={value}
					class="text-primary focus:ring-primary"
				/>
				{opt.label}
			</label>
		{/each}
	</div>
</div>
