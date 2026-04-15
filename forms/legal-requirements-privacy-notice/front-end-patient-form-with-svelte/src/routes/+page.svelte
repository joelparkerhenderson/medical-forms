<script lang="ts">
	import { acknowledgment } from '$lib/stores/acknowledgment.svelte';
	import PrivacyNotice from '$lib/components/PrivacyNotice.svelte';

	const today = new Date().toISOString().split('T')[0];

	if (!acknowledgment.data.acknowledgedDate) {
		acknowledgment.data.acknowledgedDate = today;
	}

	let isComplete = $derived(
		acknowledgment.data.confirmed &&
		acknowledgment.data.fullName.trim() !== '' &&
		acknowledgment.data.acknowledgedDate !== ''
	);

	function handleSubmit() {
		if (!isComplete) return;
		acknowledgment.submitted = true;
	}

	function handleReset() {
		acknowledgment.reset();
		acknowledgment.data.acknowledgedDate = today;
	}
</script>

<div class="min-h-screen bg-gray-50">
	<header class="bg-primary text-white py-6 shadow-md">
		<div class="max-w-3xl mx-auto px-4">
			<h1 class="text-2xl font-bold">Legal Requirements Privacy Notice</h1>
			<p class="text-blue-100 mt-1">Please read this notice carefully before confirming below</p>
		</div>
	</header>

	<main class="max-w-3xl mx-auto px-4 py-8">
		{#if acknowledgment.submitted}
			<div class="bg-white rounded-xl border border-green-300 shadow-sm p-8 text-center">
				<div class="text-success text-5xl mb-4">&#10003;</div>
				<h2 class="text-2xl font-bold text-gray-900 mb-2">Thank you</h2>
				<p class="text-gray-600 mb-4">
					Your acknowledgment has been recorded.
				</p>
				<div class="bg-light-gray rounded-lg p-4 inline-block text-left">
					<p><strong>Name:</strong> {acknowledgment.data.fullName}</p>
					<p><strong>Date:</strong> {acknowledgment.data.acknowledgedDate}</p>
				</div>
				<div class="mt-6">
					<button
						onclick={handleReset}
						class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
					>
						Submit another
					</button>
				</div>
			</div>
		{:else}
			<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
				<PrivacyNotice />
			</div>

			<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Acknowledgment</h2>

				<div class="space-y-4">
					<label class="flex items-start gap-3 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={acknowledgment.data.confirmed}
							class="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary"
						/>
						<span class="text-gray-700">
							I confirm that I have read and understood this privacy notice about how my
							information is shared to meet legal requirements.
							<span class="text-danger">*</span>
						</span>
					</label>

					<div>
						<label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">
							Full name <span class="text-danger">*</span>
						</label>
						<input
							id="fullName"
							type="text"
							bind:value={acknowledgment.data.fullName}
							placeholder="Enter your full name"
							required
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>

					<div>
						<label for="acknowledgedDate" class="block text-sm font-medium text-gray-700 mb-1">
							Date <span class="text-danger">*</span>
						</label>
						<input
							id="acknowledgedDate"
							type="date"
							bind:value={acknowledgment.data.acknowledgedDate}
							required
							class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						/>
					</div>

					<div class="pt-4">
						<button
							onclick={handleSubmit}
							disabled={!isComplete}
							class="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Submit Acknowledgment
						</button>
					</div>
				</div>
			</div>
		{/if}
	</main>

	<footer class="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-muted">
		<p>This notice is provided in accordance with UK GDPR Articles 6(1)(c) and 9(2)(h).</p>
	</footer>
</div>
