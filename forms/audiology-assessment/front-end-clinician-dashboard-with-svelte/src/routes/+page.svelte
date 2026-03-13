<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let gradeFilter = $state('');
	let tinnitusFilter = $state('');
	let aidStatusFilter = $state('');
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

	const gradeOptions = [
		{ value: '', label: 'All grades' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'mild', label: 'Mild' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'severe', label: 'Severe' },
		{ value: 'profound', label: 'Profound' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	const aidStatusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'None', label: 'None' },
		{ value: 'Candidate', label: 'Candidate' },
		{ value: 'Fitted', label: 'Fitted' },
		{ value: 'Cochlear implant candidate', label: 'Cochlear implant candidate' },
	];

	function gradeDisplay(value: string): string {
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

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
			id: 'hearingGrade',
			header: 'Hearing Grade',
			width: 130,
			sort: true,
			template: (value: string) => gradeDisplay(value),
		},
		{
			id: 'affectedEar',
			header: 'Affected Ear',
			width: 120,
			sort: true,
		},
		{
			id: 'hearingLossType',
			header: 'Type',
			width: 130,
			sort: true,
		},
		{
			id: 'tinnitus',
			header: 'Tinnitus',
			width: 100,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
		{
			id: 'hearingAidStatus',
			header: 'Aid Status',
			width: 180,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function applyFilters() {
		if (!gridApi) return;

		const term = searchTerm.toLowerCase();

		const filter = (row: PatientRow) => {
			// Text search across key fields
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Hearing grade filter
			if (gradeFilter && row.hearingGrade !== gradeFilter) {
				return false;
			}

			// Tinnitus filter
			if (tinnitusFilter === 'yes' && !row.tinnitus) return false;
			if (tinnitusFilter === 'no' && row.tinnitus) return false;

			// Aid status filter
			if (aidStatusFilter && row.hearingAidStatus !== aidStatusFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		gradeFilter = '';
		tinnitusFilter = '';
		aidStatusFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || gradeFilter !== '' || tinnitusFilter !== '' || aidStatusFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Audiology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with hearing assessment status</p>
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
						placeholder="NHS number or patient name..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Hearing Grade -->
				<div>
					<label for="grade-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Hearing Grade
					</label>
					<select
						id="grade-filter"
						bind:value={gradeFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each gradeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Tinnitus flag -->
				<div>
					<label for="tinnitus-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Tinnitus
					</label>
					<select
						id="tinnitus-filter"
						bind:value={tinnitusFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each yesNoOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Aid Status -->
				<div>
					<label for="aid-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Aid Status
					</label>
					<select
						id="aid-filter"
						bind:value={aidStatusFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each aidStatusOptions as opt (opt.value)}
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
