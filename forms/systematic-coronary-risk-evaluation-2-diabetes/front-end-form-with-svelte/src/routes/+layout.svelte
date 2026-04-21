<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<header class="border-b border-gray-200 bg-white shadow-sm">
		<div class="mx-auto max-w-4xl px-4 py-4">
			<h1 class="text-xl font-bold text-gray-800">
				<a href="/" class="hover:text-primary">SCORE2-Diabetes Risk Assessment</a>
			</h1>
			<p class="text-sm text-gray-500">Systematic Coronary Risk Evaluation 2 - Diabetes</p>
		</div>
	</header>

	<main class="mx-auto max-w-4xl px-4 py-8">
		{@render children()}
	</main>

	<footer class="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
		<p>SCORE2-Diabetes Assessment. For clinical use only. Based on ESC 2023 Guidelines.</p>
	</footer>
</div>
