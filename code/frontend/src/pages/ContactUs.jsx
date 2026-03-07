import React, { useState } from "react";

const ContactUs = () => {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		subject: "",
		message: "",
	});
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setIsSubmitted(true);
		setFormData({ fullName: "", email: "", subject: "", message: "" });
	};

	return (
		<main className="px-4 sm:px-8 lg:px-12 py-12">
			<section className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-2">
				<article className="rounded-lg border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
					<h1 className="text-3xl md:text-4xl font-semibold text-slate-800">
						Contact Us
					</h1>
					<p className="mt-3 text-gray-600">
						Have questions about the system, onboarding, or support? Send us a
						message and our team will get back to you.
					</p>

					<div className="mt-6 space-y-4 text-sm text-gray-700">
						<p>
							<span className="font-semibold text-slate-800">Email:</span>{" "}
							support@pmscare.com
						</p>
						<p>
							<span className="font-semibold text-slate-800">Phone:</span> +94
							11 234 5678
						</p>
						<p>
							<span className="font-semibold text-slate-800">Office:</span> 120
							Health Avenue, Kandy
						</p>
						<p>
							<span className="font-semibold text-slate-800">Hours:</span>
							Monday - Friday, 8:30 AM - 5:30 PM
						</p>
					</div>
				</article>

				<form
					onSubmit={handleSubmit}
					className="rounded-lg border border-slate-200 bg-white p-6 md:p-8 shadow-sm"
				>
					<h2 className="text-xl font-semibold text-slate-800">Send a Message</h2>

					<div className="mt-5 space-y-4">
						<input
							type="text"
							name="fullName"
							value={formData.fullName}
							onChange={handleChange}
							placeholder="Full Name"
							required
							className="w-full rounded-md border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
						/>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Email Address"
							required
							className="w-full rounded-md border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
						/>
						<input
							type="text"
							name="subject"
							value={formData.subject}
							onChange={handleChange}
							placeholder="Subject"
							required
							className="w-full rounded-md border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
						/>
						<textarea
							name="message"
							value={formData.message}
							onChange={handleChange}
							placeholder="Your Message"
							rows="5"
							required
							className="w-full rounded-md border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500"
						/>
					</div>

					<button
						type="submit"
						className="mt-5 w-full rounded-md bg-indigo-600 px-5 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
					>
						Submit
					</button>

					{isSubmitted && (
						<p className="mt-4 rounded-md bg-green-50 border border-green-200 text-green-700 px-4 py-2 text-sm">
							Thanks for contacting us. We will respond shortly.
						</p>
					)}
				</form>
			</section>
		</main>
	);
};

export default ContactUs;
