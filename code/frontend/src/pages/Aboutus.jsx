import React from "react";

const Aboutus = () => {
	const values = [
		{
			title: "Patient First",
			description:
				"Every feature is designed to improve patient experience, safety, and continuity of care.",
		},
		{
			title: "Secure By Design",
			description:
				"We prioritize role-based access and reliable data handling for sensitive clinical information.",
		},
		{
			title: "Team Collaboration",
			description:
				"Doctors, nurses, admins, and patients can work from one connected system.",
		},
	];

	return (
		<main className="px-4 sm:px-8 lg:px-12 py-12">
			<section className="max-w-5xl mx-auto">
				<h1 className="text-3xl md:text-4xl font-semibold text-slate-800 text-center">
					About Our Patient Management System
				</h1>
				<p className="mt-4 text-center text-gray-600 max-w-3xl mx-auto">
					Our platform helps healthcare teams manage appointments, records,
					communication, and reporting in one streamlined environment.
				</p>
			</section>

			<section className="max-w-5xl mx-auto mt-10 grid gap-6 md:grid-cols-3">
				{values.map((value) => (
					<article
						key={value.title}
						className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
					>
						<h2 className="text-lg font-semibold text-slate-800">{value.title}</h2>
						<p className="mt-2 text-sm text-gray-600">{value.description}</p>
					</article>
				))}
			</section>

			<section className="max-w-5xl mx-auto mt-10 rounded-lg border border-indigo-100 bg-indigo-50 p-6 md:p-8">
				<h2 className="text-2xl font-semibold text-slate-800">What We Support</h2>
				<ul className="mt-4 grid gap-3 text-gray-700 sm:grid-cols-2">
					<li>• Patient registration and profile management</li>
					<li>• Doctor workflows and dashboard tracking</li>
					<li>• Medical record visibility with role-based access</li>
					<li>• Unified experience for care and administration teams</li>
				</ul>
			</section>
		</main>
	);
};

export default Aboutus;
