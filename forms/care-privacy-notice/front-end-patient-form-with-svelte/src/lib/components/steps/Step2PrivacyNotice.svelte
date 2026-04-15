<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';

	const pc = $derived(assessment.data.practiceConfiguration);
	const practiceName = $derived(pc.practiceName || '[Practice name not configured]');
	const dpoName = $derived(pc.dpoName || '[DPO name not configured]');
	const dpoContact = $derived(pc.dpoContactDetails || '[DPO contact details not configured]');
	const researchOrgs = $derived(pc.researchOrganisations || '[Research organisations not configured]');
	const dataSharingPartners = $derived(pc.dataSharingPartners || '[Data sharing partners not configured]');
</script>

<div class="mx-auto max-w-2xl">
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-gray-900">Privacy Notice</h2>
		<p class="mt-1 text-sm text-gray-500">Please read the following privacy notice carefully before proceeding.</p>
	</div>

	<div class="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
		<section>
			<h3 class="mb-2 text-lg font-semibold text-gray-900">How your information is used for medical research, plan services and to measure the quality of care</h3>

			<h4 class="mb-1 font-semibold text-gray-800">Medical research and service planning</h4>
			<p class="mb-3 text-sm text-gray-700">{practiceName} uses and shares information from medical records to:</p>
			<ul class="mb-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
				<li>support medical research when the law allows us to do so, for example to learn more about why people get ill and what treatments might work best. We may also use your medical records to carry out research within the practice; and</li>
				<li>help plan NHS services.</li>
			</ul>
			<p class="mb-2 text-sm text-gray-700">Sharing information for these reasons is important because:</p>
			<ul class="mb-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
				<li>the use of information from GP medical records is very useful in developing new treatments and medicines;</li>
				<li>medical researchers use information from medical records to help answer important questions about illnesses and disease so that improvements can be made to the care and treatment patients receive;</li>
				<li>NHS organisations need information to help them plan and run NHS services, for example, deciding where to provide new GP services or clinics.</li>
			</ul>
			<p class="mb-3 text-sm text-gray-700">We share information with the following medical research organisations and with national NHS organisations with your explicit consent or when the law allows: {researchOrgs}.</p>
			<p class="mb-3 text-sm text-gray-700">You have the right to object to your confidential information being shared by this practice for medical research and planning purposes. Please speak to the practice if you wish to object.</p>
			<p class="text-sm text-gray-700">You can also visit <a href="https://www.nhs.uk/your-nhs-data-matters/" class="text-primary underline" target="_blank" rel="noopener noreferrer">nhs.uk/your-nhs-data-matters</a> if you wish to register a national data opt-out which prevents your confidential information being used for research and planning (subject to certain exclusions).</p>
		</section>

		<hr class="border-gray-200" />

		<section>
			<h3 class="mb-2 text-lg font-semibold text-gray-900">Checking the quality of care — national clinical audits</h3>
			<p class="mb-3 text-sm text-gray-700">{practiceName} contributes to national clinical audits so that healthcare can be checked and reviewed.</p>
			<ul class="mb-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
				<li>Information from medical records can help doctors and other healthcare workers measure and check the quality of care which is provided to you.</li>
				<li>The results of the checks or audits can show where hospitals are doing well and where they need to improve.</li>
				<li>The results of the checks or audits are used to recommend improvements to patient care.</li>
				<li>Data are sent to the Healthcare Quality Improvements Partnership (HQIP), a national body which manages clinical audits on behalf of the NHS. For more about HQIP please visit <a href="https://www.hqip.org.uk" class="text-primary underline" target="_blank" rel="noopener noreferrer">hqip.org.uk</a> or phone 020 7997 7370.</li>
				<li>The data could include information about you, such as your NHS Number and date of birth, and information about your health which is recorded in coded form — for example, the code for diabetes or high blood pressure.</li>
			</ul>
			<p class="mb-3 text-sm text-gray-700">We will only share your information for national clinical audits or checking purposes when the law allows.</p>
			<p class="text-sm text-gray-700">You have the right to object to your confidential information being shared for national clinical audits. Please visit <a href="https://www.nhs.uk/your-nhs-data-matters/" class="text-primary underline" target="_blank" rel="noopener noreferrer">nhs.uk/your-nhs-data-matters</a> if you wish to find out more or register a national data opt-out (NDOO). The NDOO prevents your confidential information being used for research and planning and can apply to some national clinical audits. However, there are certain circumstances when the NDOO will not apply to audits, for example, when information is needed for reasons of patient safety.</p>
		</section>

		<hr class="border-gray-200" />

		<section>
			<h3 class="mb-2 text-lg font-semibold text-gray-900">Legal information</h3>
			<p class="mb-3 text-sm text-gray-700">We are required by law to provide you with the following information about how we share your information for medical research purposes.</p>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Data Controller contact details</p>
				<p class="text-sm text-gray-700">{practiceName}</p>
			</div>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Data Protection Officer contact details</p>
				<p class="text-sm text-gray-700">{dpoName} — {dpoContact}</p>
			</div>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Purpose of the processing</p>
				<p class="text-sm text-gray-700">Medical research and to check the quality of care which is given to patients (this is called national clinical audit).</p>
			</div>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Lawful basis for processing</p>
				<p class="mb-1 text-sm text-gray-700">The following sections of the UK GDPR mean that we can use medical records for research and to check the quality of care (national clinical audits):</p>
				<ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
					<li>Article 6(1)(e) — processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller.</li>
					<li>Article 9(2)(a) — the data subject has given explicit consent.</li>
					<li>Article 9(2)(j) — processing is necessary for scientific or historical research purposes or statistical purposes.</li>
					<li>Article 9(2)(h) — processing is necessary for the purpose of preventative medicine, the provision of health or social care or treatment, or the management of health or social care systems and services.</li>
				</ul>
			</div>
		</section>

		<hr class="border-gray-200" />

		<section>
			<h3 class="mb-2 text-lg font-semibold text-gray-900">Recipients and your rights</h3>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Recipient or categories of recipients</p>
				<p class="text-sm text-gray-700">For medical research, data will be shared with: {researchOrgs}. For health service planning, data will be shared with: {dataSharingPartners}. For national clinical audits, the data will be shared with the Healthcare Quality Improvements Partnership (HQIP).</p>
			</div>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Right to object and the National Data Opt-out</p>
				<p class="mb-1 text-sm text-gray-700">The law gives you a right to object to data processing in certain circumstances. The NHS also has different policy options for opting out of data sharing.</p>
				<p class="mb-1 text-sm text-gray-700">You can stop your GP practice from sharing your confidential information for reasons beyond your own care, such as research and planning. This is called a "Type 1 opt-out". To do this you need to fill in an opt-out form and return it to your GP practice.</p>
				<p class="text-sm text-gray-700">The National Data Opt-out (NDOO) allows you to choose if you do not want NHS England and other healthcare organisations to use your confidential information for reasons beyond your own individual care. Please visit <a href="https://www.nhs.uk/your-nhs-data-matters/" class="text-primary underline" target="_blank" rel="noopener noreferrer">nhs.uk/your-nhs-data-matters</a> to find out more about your options.</p>
			</div>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Right of access and right to correct</p>
				<ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
					<li>You have the right to access your medical record. Please speak to a member of staff.</li>
					<li>You have the right to correct personal information which is inaccurate or a mistake. Please speak to a member of staff.</li>
				</ul>
			</div>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Right to restriction of processing</p>
				<p class="text-sm text-gray-700">You have the right to ask us to restrict the processing of your personal information in certain circumstances. Please contact us if you would like to make a request.</p>
			</div>

			<div class="mb-3">
				<p class="text-sm font-semibold text-gray-800">Retention period</p>
				<p class="text-sm text-gray-700">GP medical records will be kept in line with the law and national guidance. Information on how long records are kept can be found at <a href="https://transform.england.nhs.uk/information-governance/guidance/records-management-code/" class="text-primary underline" target="_blank" rel="noopener noreferrer">Records Management Code</a> or speak to the practice.</p>
			</div>

			<div>
				<p class="text-sm font-semibold text-gray-800">Right to complain</p>
				<p class="text-sm text-gray-700">You have the right to complain to the Information Commissioner's Office. If you wish to complain, visit <a href="https://ico.org.uk/global/contact-us/" class="text-primary underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or call the helpline 0303 123 1113.</p>
			</div>
		</section>
	</div>
</div>
