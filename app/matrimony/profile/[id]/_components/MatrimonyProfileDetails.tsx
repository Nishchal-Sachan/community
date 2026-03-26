type ProfileRow = { label: string; value: string };

type MatrimonyProfileDetailsProps = {
  profileSummaryItems: ProfileRow[];
  genderLabel: string;
  height: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  income: string;
  location: string;
  about: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

export function MatrimonyProfileDetails({
  profileSummaryItems,
  genderLabel,
  height,
  maritalStatus,
  religion,
  caste,
  income,
  location,
  about,
  contactName,
  contactPhone,
  contactEmail,
}: MatrimonyProfileDetailsProps) {
  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md sm:p-6"
        aria-labelledby="profile-summary-heading"
      >
        <h2 id="profile-summary-heading" className="font-body text-sm font-semibold text-gray-900">
          मुख्य विवरण
        </h2>
        <dl className="mt-3 flex flex-col gap-3">
          {profileSummaryItems.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="font-body text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
              <dd className="mt-0.5 font-body text-sm leading-snug text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md sm:p-6">
        <dl className="flex flex-col gap-4 font-body text-sm">
          <div>
            <dt className="font-medium text-gray-500">लिंग</dt>
            <dd className="mt-0.5 text-gray-900">{genderLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">ऊँचाई</dt>
            <dd className="mt-0.5 text-gray-900">{height}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">वैवाहिक स्थिति</dt>
            <dd className="mt-0.5 text-gray-900">{maritalStatus}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">धर्म / जाति</dt>
            <dd className="mt-0.5 text-gray-900">
              {religion}
              {caste ? ` · ${caste}` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">आय</dt>
            <dd className="mt-0.5 text-gray-900">{income}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">पता / स्थान</dt>
            <dd className="mt-0.5 text-gray-900">{location}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">परिचय</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-gray-800">{about}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md sm:p-6">
        <h2 className="font-body text-sm font-semibold text-gray-900">संपर्क</h2>
        <ul className="mt-3 space-y-1.5 font-body text-sm">
          <li>
            <span className="text-gray-500">नाम: </span>
            <span className="text-gray-900">{contactName}</span>
          </li>
          <li>
            <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="text-[#b45309] hover:underline">
              {contactPhone}
            </a>
          </li>
          <li>
            <a href={`mailto:${contactEmail}`} className="text-[#b45309] hover:underline">
              {contactEmail}
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
