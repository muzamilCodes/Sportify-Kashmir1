"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for unused items in their original packaging. Custom-engraved trophies or personalized jerseys are not eligible for returns unless defective."
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery within Kashmir takes 2-4 business days. For remote areas, it might take up to 6 business days. Expedited shipping is available at checkout."
  },
  {
    question: "Do you offer bulk discounts for teams or schools?",
    answer: "Yes! We offer special pricing for team orders, schools, and bulk purchases. Please contact our support team at wholesale@sportifykashmir.com for a custom quote."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you will receive a tracking link via email and SMS. You can also track your order by logging into your account and visiting the 'My Orders' section."
  },
  {
    question: "Are your products authentic?",
    answer: "Absolutely. We source all our products directly from authorized distributors and manufacturers. Every product comes with a 100% authenticity guarantee."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD) for most locations."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about orders, shipping, and our products. Can't find what you're looking for? Reach out to us directly.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 last:border-0">
              <button
                className="w-full text-left px-8 py-6 flex justify-between items-center focus:outline-none hover:bg-orange-50/50 transition-colors"
                onClick={() => toggleAccordion(index)}
              >
                <span className={`text-lg font-semibold transition-colors ${openIndex === index ? "text-orange-600" : "text-gray-800"}`}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${openIndex === index ? "rotate-180 text-orange-500" : ""}`}
                />
              </button>
              <div
                className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-10 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Our support team is always ready to help you with any queries you might have.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
