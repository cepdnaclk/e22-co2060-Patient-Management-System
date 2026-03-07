import React, { useState } from "react";

const faqItems = [
  {
    question: "How do I create a patient account?",
    answer:
      "Open the Sign up page, complete your personal details, and submit the registration form. Once your account is approved, you can sign in and access your patient dashboard.",
  },
  {
    question: "Can doctors and patients use different dashboards?",
    answer:
      "Yes. The system uses role-based access, so each user type sees a dedicated dashboard with tools relevant to their role and permissions.",
  },
  {
    question: "How do I reset my password if I cannot log in?",
    answer:
      "If you cannot access your account, contact the support team through the Contact page. Include your registered email and role so we can verify and assist quickly.",
  },
  {
    question: "Can I view my previous appointments and records?",
    answer:
      "Yes. Signed-in users can access available appointment and medical information from their dashboards, depending on role permissions.",
  },
  {
    question: "Is patient data secure in this system?",
    answer:
      "Yes. Access is restricted through authentication and role permissions so only authorized users can view or update sensitive health data.",
  },
  {
    question: "Who can update a medical record?",
    answer:
      "Medical information updates are limited to authorized clinical or administrative users based on role access configured in the system.",
  },
  {
    question: "Can I update my profile information later?",
    answer:
      "Yes. You can edit available profile fields from your role-specific dashboard after signing in.",
  },
  {
    question: "What should I do if I find incorrect patient information?",
    answer:
      "Report it to your authorized admin or care team immediately. They can review the record and make corrections according to access policies.",
  },
  {
    question: "How can I contact support?",
    answer:
      "Use the Contact page form or reach support through the listed email and phone details. For faster help, include your name, account email, and a short problem summary.",
  },
  {
    question: "How long does support usually take to respond?",
    answer:
      "Support requests are typically reviewed during business hours, Monday to Friday. Response time may vary based on issue priority.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleToggle = (index) => {
    setActiveIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <main className="px-4 sm:px-8 lg:px-12 py-12">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 text-center">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
          Find detailed answers about accounts, role-based dashboards, records,
          and support in one place.
        </p>

        <div className="mt-10 space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = activeIndex === index;

            return (
              <article
                key={item.question}
                className="rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-slate-800">{item.question}</span>
                  <span className="text-indigo-600 text-xl leading-none">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-600">{item.answer}</div>
                )}
              </article>
            );
          })}
        </div>

        <section className="mt-10 rounded-lg border border-indigo-100 bg-indigo-50 p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-slate-800">
            Still need help?
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            If your question is not listed here, please use the Contact page and
            include relevant details such as your role, account email, and issue
            description.
          </p>
          <ul className="mt-3 text-sm text-gray-700 space-y-1">
            <li>• Email: support@pmscare.com</li>
            <li>• Phone: +94 11 234 5678</li>
            <li>• Support Hours: Monday - Friday, 8:30 AM - 5:30 PM</li>
          </ul>
        </section>
      </section>
    </main>
  );
};

export default FAQ;
