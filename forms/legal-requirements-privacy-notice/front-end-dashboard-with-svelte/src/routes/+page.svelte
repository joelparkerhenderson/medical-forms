<script lang="ts">
	import { Grid, Willow } from 'wx-svelte-grid';
	import { fetchAcknowledgments } from '$lib/api';
	import { sampleData } from '$lib/data';
	import type { AcknowledgmentRow } from '$lib/types';

	let data = $state<AcknowledgmentRow[]>([]);
	let searchQuery = $state('');
	let statusFilter = $state('all');
	let gridApi = $state<any>(null);

	let filteredData = $derived.by(() => {
		let rows = data;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			rows = rows.filter(
				(r) =>
					r.patientName.toLowerCase().includes(q) ||
					r.nhsNumber.includes(q)
			);
		}
		if (statusFilter !== 'all') {
			rows = rows.filter((r) => r.status === statusFilter);
		}
		return rows;
	});

	let hasFilters = $derived(searchQuery !== '' || statusFilter !== 'all');

	function clearFilters() {
		searchQuery = '';
		statusFilter = 'all';
	}

	const columns = [
		{
			id: 'patientName',
			header: 'Patient Name',
			flexgrow: 2,
			sort: true
		},
		{
			id: 'nhsNumber',
			header: 'NHS Number',
			flexgrow: 1,
			sort: true
		},
		{
			id: 'acknowledgedDate',
			header: 'Acknowledged Date',
			flexgrow: 1,
			sort: true
		},
		{
			id: 'status',
			header: 'Status',
			flexgrow: 1,
			sort: true
		}
	];

	$effect(() => {
		fetchAcknowledgments().then((res) => {
			data = res.items;
		});
	});

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'acknowledgedDate', order: 'desc' });
	}
</script>

<div class="min-h-screen bg-gray-50">
	<header class="bg-primary text-white py-6 shadow-md">
		<div class="max-w-6xl mx-auto px-4">
			<h1 class="text-2xl font-bold">Legal Requirements Privacy Notice</h1>
			<p class="text-blue-100 mt-1">Clinician Dashboard — Patient Acknowledgments</p>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-8">
		<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
			<div class="flex flex-wrap items-center gap-4 mb-6">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by name or NHS number..."
					class="flex-1 min-w-48 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				<select
					bind:value={statusFilter}
					class="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
				>
					<option value="all">All statuses</option>
					<option value="complete">Complete</option>
					<option value="incomplete">Incomplete</option>
				</select>
				{#if hasFilters}
					<button
						onclick={clearFilters}
						class="px-4 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-blue-50 transition-colors"
					>
						Clear filters
					</button>
				{/if}
			</div>

			<p class="text-sm text-muted mb-4">
				Showing {filteredData.length} of {data.length} acknowledgments
			</p>

			<div style="height: 500px;">
				<Willow>
					<Grid
						{columns}
						data={filteredData}
						oninit={init}
					/>
				</Willow>
			</div>
		</div>
	</main>
</div>
