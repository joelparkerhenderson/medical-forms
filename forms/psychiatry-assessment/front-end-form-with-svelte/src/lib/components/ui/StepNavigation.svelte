<script lang="ts">
	let {
		prevHref,
		nextHref,
		isLast = false,
		onsubmit
	}: {
		prevHref: string | null;
		nextHref: string | null;
		isLast?: boolean;
		onsubmit?: () => void;
	} = $props();
</script>

<div class="mt-8 flex justify-between">
	{#if prevHref}
		<a
			href={prevHref}
			class="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
		>
			&larr; Previous
		</a>
	{:else}
		<div></div>
	{/if}

	{#if isLast}
		<button
			type="button"
			onclick={onsubmit}
			class="rounded-lg bg-primary px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
		>
			Submit Assessment
		</button>
	{:else if nextHref}
		<a
			href={nextHref}
			class="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
		>
			Next &rarr;
		</a>
	{/if}
</div>
