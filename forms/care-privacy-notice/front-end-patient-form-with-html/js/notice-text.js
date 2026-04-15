// Renders the BMA GDPR privacy notice template with practice config interpolated.
// Source: https://www.bma.org.uk/advice-and-support/ethics/confidentiality-and-health-records/gdpr-privacy-notices-for-gp-practices

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

export function renderNoticeHtml(cfg) {
  const name = esc(cfg.practiceName) || '[Practice Name]';
  const address = esc(cfg.practiceAddress) || '[Practice Address]';
  const dpoName = esc(cfg.dpoName) || '[DPO Name]';
  const dpoContact = esc(cfg.dpoContactDetails) || '[DPO Contact Details]';
  const partners = cfg.dataSharingPartners && cfg.dataSharingPartners.trim()
    ? esc(cfg.dataSharingPartners)
    : null;
  const research = cfg.researchOrganisations && cfg.researchOrganisations.trim()
    ? esc(cfg.researchOrganisations)
    : null;

  return `
<h2>How ${name} uses your information to provide you with healthcare</h2>

<p>This practice keeps medical records confidential and complies with the UK General Data Protection
Regulation and Data Protection Act 2018.</p>

<p>We hold your medical record so that we can provide you with safe care and treatment. We will also
use your information so that this practice can check and review the quality of the care we provide.
This helps us to improve our services to you.</p>

<ul>
  <li>We will share relevant information from your medical record with other health or social care
  staff or organisations when they provide you with care. For example, your GP will share
  information when they refer you to a specialist in a hospital. Or your GP will send details about
  your prescription to your chosen pharmacy.</li>
  <li>Healthcare staff working in A&amp;E and out of hours care will also have access to your
  information via your Summary Care Record. For more information see:
  <a href="https://digital.nhs.uk/summary-care-records" target="_blank" rel="noopener">
  https://digital.nhs.uk/summary-care-records</a> or alternatively speak to your practice.</li>
  <li>You have the right to object to information being shared for your own care. Please speak to
  the practice if you wish to object. You also have the right to have any mistakes or errors
  corrected.</li>
</ul>

<h3>Other important information about how your information is used to provide you with healthcare</h3>

<h4>Registering for NHS care</h4>
<p>All patients who receive NHS care are registered on a national database.</p>
<ul>
  <li>This database holds your name, address, date of birth, and NHS Number but it does not hold
  information about the care you receive.</li>
  <li>The database is held by NHS England (or equivalent), a national organisation which has legal
  responsibilities to collect NHS data.</li>
</ul>

<h4>Identifying patients who might be at risk of certain diseases</h4>
<ul>
  <li>Your medical records will be searched by a computer programme so that we can identify patients
  who might be at high risk from certain diseases such as heart disease or unplanned admissions to
  hospital. This means we can offer patients additional care or support as early as possible.</li>
  <li>This process will involve linking information from your GP record with information from other
  health or social care services you have used.</li>
  <li>Information which identifies you will only be seen by this practice.</li>
</ul>

<h4>Safeguarding</h4>
<ul>
  <li>Sometimes we need to share information so that other people, including healthcare staff,
  children or others with safeguarding needs, are protected from risk of harm.</li>
  <li>These circumstances are rare.</li>
  <li>We do not need your consent or agreement to do this.</li>
</ul>

<hr>

<p>We are required by law to provide you with the following information about how we handle your
information and your individual rights.</p>

<table class="notice-table">
  <tbody>
    <tr>
      <th scope="row">Data Controller contact details</th>
      <td>${name}, ${address}</td>
    </tr>
    <tr>
      <th scope="row">Data Protection Officer contact details</th>
      <td>${dpoName}, ${dpoContact}</td>
    </tr>
    <tr>
      <th scope="row">Purpose of the processing</th>
      <td>
        <ul>
          <li>To give direct health or social care to individual patients.</li>
          <li>For example, when a patient agrees to a referral for direct care, such as to a
          hospital, relevant information about the patient will be shared with the other healthcare
          staff to enable them to give appropriate advice, investigations, treatments and/or
          care.</li>
          <li>To check and review the quality of care. (This is called audit and clinical
          governance).</li>
        </ul>
      </td>
    </tr>
    <tr>
      <th scope="row">Lawful basis for processing</th>
      <td>
        <p>These purposes are supported under the following sections of the UK GDPR:</p>
        <p>Article 6(1)(e) &mdash; &ldquo;necessary for the performance of a task carried out in
        the public interest or in the exercise of official authority&rdquo;; and</p>
        <p>Article 9(2)(h) &mdash; &ldquo;necessary for the purposes of preventative or
        occupational medicine for the assessment of the working capacity of the employee, medical
        diagnosis, the provision of health or social care or treatment or the management of health
        or social care systems and services&rdquo;.</p>
        <p>Healthcare staff will also respect and comply with their obligations under the common law
        duty of confidence.</p>
      </td>
    </tr>
    <tr>
      <th scope="row">Recipients of processed data</th>
      <td>
        <p>The data will be shared with:</p>
        <ul>
          <li>Healthcare professionals and staff in this surgery; local hospitals; out of hours
          services; diagnostic and treatment centres; or other organisations involved in the
          provision of direct care to individual patients.</li>
          <li>National NHS bodies, such as NHS England, when legally required to develop IT systems
          and data programmes with the appropriate organisations, in certain circumstances where
          there is a risk of serious harm to a person or a serious crime has been committed.</li>
          ${partners ? `<li>${partners}</li>` : ''}
        </ul>
      </td>
    </tr>
    <tr>
      <th scope="row">Right to object</th>
      <td>
        <p>You have the right to object to the processing of your personal information in certain
        circumstances. This may affect the care you receive &mdash; please speak to the
        practice.</p>
        <ul>
          <li>You are not able to object to your name, address and other demographic information
          being sent to NHS England (or equivalent body). This is necessary if you wish to be
          registered to receive NHS care.</li>
          <li>You are not able to object when information is legitimately shared for safeguarding
          reasons or when the public interest outweighs your right to confidentiality, for example
          when a serious crime has been committed.</li>
        </ul>
        <p><strong>National Data Opt-out (England only):</strong> You can choose to opt out of your
        confidential information being used for reasons beyond your own individual care, for example
        medical research and planning. Please visit:
        <a href="https://www.nhs.uk/your-nhs-data-matters/" target="_blank" rel="noopener">
        https://www.nhs.uk/your-nhs-data-matters/</a> to find out more about your options and to
        register your choice.</p>
      </td>
    </tr>
    <tr>
      <th scope="row">Right of access and right to correct</th>
      <td>
        <ul>
          <li>You have the right to access your medical record. Please speak to a member of
          staff.</li>
          <li>You have the right to correct personal information which is inaccurate or a mistake.
          Please speak to a member of staff.</li>
          <li>We are not aware of any circumstances in which you will have the right to delete
          correct information from your medical record.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <th scope="row">Right to restriction of processing</th>
      <td>You have the right to ask us to restrict the processing of your personal information in
      certain circumstances. Please contact us if you would like to make a request.</td>
    </tr>
    <tr>
      <th scope="row">Retention period</th>
      <td>GP medical records will be kept in line with the law and national guidance. Information
      on how long records are kept can be found at:
      <a href="https://transform.england.nhs.uk/information-governance/guidance/records-management-code/"
         target="_blank" rel="noopener">
      https://transform.england.nhs.uk/information-governance/guidance/records-management-code/</a>
      or speak to the practice.</td>
    </tr>
    <tr>
      <th scope="row">Right to complain</th>
      <td>You have the right to complain to the Information Commissioner&rsquo;s Office. If you
      wish to complain, follow this link:
      <a href="https://ico.org.uk/global/contact-us/" target="_blank" rel="noopener">
      https://ico.org.uk/global/contact-us/</a> or call the helpline 0303 123 1113.</td>
    </tr>
    <tr>
      <th scope="row">Data we get from other organisations</th>
      <td>We receive information about your health from other organisations who are involved in
      providing you with health and social care. For example, if you go to hospital for treatment
      or an operation the hospital will send us a letter to let us know what happened. This means
      your GP medical record is kept up-to-date when you receive care from other parts of the
      health service.</td>
    </tr>
    ${research ? `
    <tr>
      <th scope="row">Research organisations</th>
      <td>${research}</td>
    </tr>
    ` : ''}
  </tbody>
</table>
`;
}
