<script lang="ts">
	let {
		value = $bindable(''),
		required = false
	}: {
		value: string;
		required?: boolean;
	} = $props();
</script>

<div class="mb-4">
	<label for="histology" class="mb-1 block text-sm font-medium text-gray-700">
		Histology
		{#if required}<span class="text-red-500">*</span>{/if}
	</label>
	<select
		id="histology"
		name="histology"
		{required}
		bind:value
		class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
	>
		<option value="">-- Select --</option>

		<optgroup label="Carcinoma — Adenocarcinoma">
			<option value="adenocarcinoma">Adenocarcinoma</option>
			<option value="invasive-ductal-carcinoma">Invasive ductal carcinoma</option>
			<option value="invasive-lobular-carcinoma">Invasive lobular carcinoma</option>
			<option value="mucinous-adenocarcinoma">Mucinous adenocarcinoma</option>
			<option value="papillary-adenocarcinoma">Papillary adenocarcinoma</option>
			<option value="signet-ring-cell-carcinoma">Signet ring cell carcinoma</option>
			<option value="clear-cell-carcinoma">Clear cell carcinoma</option>
			<option value="cholangiocarcinoma">Cholangiocarcinoma</option>
		</optgroup>

		<optgroup label="Carcinoma — Squamous &amp; Transitional">
			<option value="squamous-cell-carcinoma">Squamous cell carcinoma</option>
			<option value="basal-cell-carcinoma">Basal cell carcinoma</option>
			<option value="transitional-cell-carcinoma">Transitional cell (urothelial) carcinoma</option>
			<option value="nasopharyngeal-carcinoma">Nasopharyngeal carcinoma</option>
		</optgroup>

		<optgroup label="Carcinoma — Small Cell &amp; Neuroendocrine">
			<option value="small-cell-carcinoma">Small cell carcinoma</option>
			<option value="large-cell-carcinoma">Large cell carcinoma</option>
			<option value="large-cell-neuroendocrine-carcinoma">Large cell neuroendocrine carcinoma</option>
			<option value="neuroendocrine-tumour">Neuroendocrine tumour</option>
			<option value="carcinoid-tumour">Carcinoid tumour</option>
			<option value="merkel-cell-carcinoma">Merkel cell carcinoma</option>
		</optgroup>

		<optgroup label="Carcinoma — Renal &amp; Hepatic">
			<option value="renal-cell-carcinoma">Renal cell carcinoma</option>
			<option value="hepatocellular-carcinoma">Hepatocellular carcinoma</option>
		</optgroup>

		<optgroup label="Carcinoma — Other">
			<option value="serous-carcinoma">Serous carcinoma</option>
			<option value="endometrioid-carcinoma">Endometrioid carcinoma</option>
			<option value="medullary-carcinoma">Medullary carcinoma</option>
			<option value="anaplastic-carcinoma">Anaplastic carcinoma</option>
			<option value="undifferentiated-carcinoma">Undifferentiated carcinoma</option>
		</optgroup>

		<optgroup label="Sarcoma">
			<option value="osteosarcoma">Osteosarcoma</option>
			<option value="chondrosarcoma">Chondrosarcoma</option>
			<option value="leiomyosarcoma">Leiomyosarcoma</option>
			<option value="rhabdomyosarcoma">Rhabdomyosarcoma</option>
			<option value="liposarcoma">Liposarcoma</option>
			<option value="fibrosarcoma">Fibrosarcoma</option>
			<option value="angiosarcoma">Angiosarcoma</option>
			<option value="ewing-sarcoma">Ewing sarcoma</option>
			<option value="gastrointestinal-stromal-tumour">Gastrointestinal stromal tumour (GIST)</option>
			<option value="kaposi-sarcoma">Kaposi sarcoma</option>
		</optgroup>

		<optgroup label="Lymphoma">
			<option value="hodgkin-lymphoma">Hodgkin lymphoma</option>
			<option value="diffuse-large-b-cell-lymphoma">Diffuse large B-cell lymphoma</option>
			<option value="follicular-lymphoma">Follicular lymphoma</option>
			<option value="mantle-cell-lymphoma">Mantle cell lymphoma</option>
			<option value="marginal-zone-lymphoma">Marginal zone lymphoma</option>
			<option value="burkitt-lymphoma">Burkitt lymphoma</option>
			<option value="t-cell-lymphoma">T-cell lymphoma</option>
		</optgroup>

		<optgroup label="Leukaemia &amp; Myeloma">
			<option value="acute-myeloid-leukaemia">Acute myeloid leukaemia (AML)</option>
			<option value="acute-lymphoblastic-leukaemia">Acute lymphoblastic leukaemia (ALL)</option>
			<option value="chronic-lymphocytic-leukaemia">Chronic lymphocytic leukaemia (CLL)</option>
			<option value="chronic-myeloid-leukaemia">Chronic myeloid leukaemia (CML)</option>
			<option value="multiple-myeloma">Multiple myeloma</option>
			<option value="myelodysplastic-syndrome">Myelodysplastic syndrome</option>
		</optgroup>

		<optgroup label="Melanoma">
			<option value="superficial-spreading-melanoma">Superficial spreading melanoma</option>
			<option value="nodular-melanoma">Nodular melanoma</option>
			<option value="lentigo-maligna-melanoma">Lentigo maligna melanoma</option>
			<option value="acral-lentiginous-melanoma">Acral lentiginous melanoma</option>
			<option value="uveal-melanoma">Uveal melanoma</option>
			<option value="mucosal-melanoma">Mucosal melanoma</option>
		</optgroup>

		<optgroup label="CNS Tumours">
			<option value="glioblastoma">Glioblastoma (GBM)</option>
			<option value="astrocytoma">Astrocytoma</option>
			<option value="oligodendroglioma">Oligodendroglioma</option>
			<option value="meningioma">Meningioma</option>
			<option value="medulloblastoma">Medulloblastoma</option>
			<option value="ependymoma">Ependymoma</option>
		</optgroup>

		<optgroup label="Germ Cell Tumours">
			<option value="seminoma">Seminoma</option>
			<option value="non-seminomatous-germ-cell">Non-seminomatous germ cell tumour</option>
			<option value="teratoma">Teratoma</option>
			<option value="choriocarcinoma">Choriocarcinoma</option>
			<option value="yolk-sac-tumour">Yolk sac tumour</option>
		</optgroup>

		<optgroup label="Other">
			<option value="mesothelioma">Mesothelioma</option>
			<option value="thymoma">Thymoma</option>
			<option value="phaeochromocytoma">Phaeochromocytoma</option>
			<option value="other">Other</option>
		</optgroup>
	</select>
</div>
