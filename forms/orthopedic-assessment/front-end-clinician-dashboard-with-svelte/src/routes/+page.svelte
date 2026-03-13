<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let dashFilter = $state('');
	let disabilityFilter = $state('');
	let surgicalFilter = $state('');
	let gridApi = $state<any>(null);

	// Load patients from backend API, fall back to sample data
	$effect(() => {
		fetchPatients()
			.then((items) => {
				if (items.length > 0) {
					patients = items;
				}
				loading = false;
			})
			.catch(() => {
				// Backend unavailable — use sample data
				loading = false;
			});
	});

	const dashOptions = [
		{ value: '', label: 'All DASH scores' },
		{ value: '0-20', label: 'No disability (0-20)' },
		{ value: '21-40', label: 'Mild disability (21-40)' },
		{ value: '41-60', label: 'Moderate disability (41-60)' },
		{ value: '61-80', label: 'Severe disability (61-80)' },
		{ value: '81-100', label: 'Very severe disability (81-100)' },
	];

	const disabilityOptions = [
		{ value: '', label: 'All disability levels' },
		{ value: 'No disability', label: 'No disability' },
		{ value: 'Mild disability', label: 'Mild disability' },
		{ value: 'Moderate disability', label: 'Moderate disability' },
		{ value: 'Severe disability', label: 'Severe disability' },
		{ value: 'Very severe disability', label: 'Very severe disability' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	const columns = [
		{
			id: 'nhsNumber',
			header: 'NHS Number',
			width: 140,
			sort: true,
		},
		{
			id: 'patientName',
			header: 'Patient Name',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'dashScore',
			header: 'DASH Score',
			width: 110,
			sort: true,
			template: (value: number) => `${value}/100`,
		},
		{
			id: 'affectedJoint',
			header: 'Affected Joint',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'disabilityLevel',
			header: 'Disability Level',
			width: 180,
			sort: true,
		},
		{
			id: 'surgicalCandidate',
			header: 'Surgical Candidate',
			width: 140,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function dashInRange(score: number, range: string): boolean {
		switch (range) {
			case '0-20': return score >= 0 && score <= 20;
			case '21-40': return score >= 21 && score <= 40;
			case '41-60': return score >= 41 && score <= 60;
			case '61-80': return score >= 61 && score <= 80;
			case '81-100': return score >= 81 && score <= 100;
			default: return true;
		}
	}

	function applyFilters() {
		if (!gridApi) return;

		const term = searchTerm.toLowerCase();

		const filter = (row: PatientRow) => {
			// Text search across key fields
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term) ||
					row.affectedJoint.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// DASH score range filter
			if (dashFilter && !dashInRange(row.dashScore, dashFilter)) {
				return false;
			}

			// Disability level filter
			if (disabilityFilter && row.disabilityLevel !== disabilityFilter) {
				return false;
			}

			// Surgical candidate filter
			if (surgicalFilter === 'yes' && !row.surgicalCandidate) return false;
			if (surgicalFilter === 'no' && row.surgicalCandidate) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		dashFilter = '';
		disabilityFilter = '';
		surgicalFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || dashFilter !== '' || disabilityFilter !== '' || surgicalFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Orthopedic Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with orthopedic assessment status</p>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<!-- Filters bar -->
		<div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
			<div class="flex flex-wrap items-end gap-4">
				<!-- Search -->
				<div class="min-w-[240px] flex-1">
					<label for="search" class="mb-1 block text-sm font-medium text-gray-700">
						Search
					</label>
					<input
						id="search"
						type="text"
						placeholder="NHS number, name, or joint..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- DASH Score -->
				<div>
					<label for="dash-filter" class="mb-1 block text-sm font-medium text-gray-700">
						DASH Score
					</label>
					<select
						id="dash-filter"
						bind:value={dashFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each dashOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Disability Level -->
				<div>
					<label for="disability-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Disability Level
					</label>
					<select
						id="disability-filter"
						bind:value={disabilityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each disabilityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Surgical Candidate -->
				<div>
					<label for="surgical-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Surgical Candidate
					</label>
					<select
						id="surgical-filter"
						bind:value={surgicalFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each yesNoOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Clear filters -->
				{#if hasActiveFilters}
					<button
						onclick={clearFilters}
						class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
					>
						Clear filters
					</button>
				{/if}
			</div>
		</div>

		<!-- Data grid -->
		<div class="rounded-lg bg-white shadow-sm" style="height: 600px;">
			{#if loading}
				<div class="flex h-full items-center justify-center text-muted">
					Loading patients...
				</div>
			{:else}
				<Willow>
					<Grid data={patients} {columns} {init} />
				</Willow>
			{/if}
		</div>

		<!-- Summary -->
		<div class="mt-4 flex items-center gap-4 text-sm text-muted">
			<span>{patients.length} patients total</span>
			{#if error}
				<span class="text-warning">{error}</span>
			{/if}
		</div>
	</main>
</div>
