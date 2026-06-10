import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { Shield, BookOpen, AlertCircle, CreditCard, Scale, FileText } from 'lucide-react';

const Terms = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'registration', title: '2. Account Registration', icon: <FileText className="w-5 h-5" /> },
    { id: 'booking', title: '3. Booking Policies', icon: <FileText className="w-5 h-5" /> },
    { id: 'cancellation', title: '4. Cancellation & Refunds', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 'payments', title: '5. Payments & Transactions', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'responsibilities', title: '6. User Responsibilities', icon: <Shield className="w-5 h-5" /> },
    { id: 'liability', title: '7. Limitation of Liability', icon: <Scale className="w-5 h-5" /> },
  ];

  // Basic scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const pageYOffset = window.scrollY;
      let newActiveSection = sections[0].id;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= pageYOffset + 150) {
          newActiveSection = sections[i].id;
          break;
        }
      }
      setActiveSection(newActiveSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      
      {/* Header Banner */}
      <div className="bg-[#111827] text-white pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Terms of Service</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using Stayzium. They outline your rights, responsibilities, and our commitment to you.
          </p>
          <p className="text-sm text-gray-500 mt-6">Last Updated: June 1, 2026</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Sticky Sidebar */}
        <div className="lg:w-1/4 hidden lg:block">
          <div className="sticky top-28 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 px-3">Contents</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    activeSection === section.id
                      ? 'bg-[#2962ff]/10 text-[#2962ff]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`${activeSection === section.id ? 'text-[#2962ff]' : 'text-gray-400'}`}>
                    {section.icon}
                  </span>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-blue max-w-none">
            
            <section id="acceptance" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                By accessing, browsing, or using the Stayzium platform (including our website, mobile applications, and related services), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                If you do not agree to these terms, you must not use our platform or services. We reserve the right to modify these terms at any time. Your continued use of the platform following the posting of changes will mean that you accept and agree to the changes.
              </p>
            </section>

            <section id="registration" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">2. Account Registration</h2>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-6">
                <li><strong>Eligibility:</strong> You must be at least 18 years old to create an account and make bookings on Stayzium.</li>
                <li><strong>Accuracy of Information:</strong> You agree to provide current, accurate, and complete information during the registration process and to keep your account information updated.</li>
                <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials (password) and for all activities that occur under your account. Notify us immediately of any unauthorized use.</li>
              </ul>
            </section>

            <section id="booking" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">3. Booking Policies</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                Stayzium acts as an intermediary connecting users with hotel owners and property managers.
              </p>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-6">
                <li><strong>Confirmation:</strong> A booking is only confirmed once you receive a confirmation email with a valid booking reference number.</li>
                <li><strong>Pricing Errors:</strong> While we strive for accuracy, if a manifest error in pricing occurs, we reserve the right to cancel the booking and refund your payment in full.</li>
                <li><strong>Check-in Requirements:</strong> You must present a valid government-issued photo ID and a valid credit card at check-in. The name on the ID must match the name on the booking.</li>
              </ul>
            </section>

            <section id="cancellation" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">4. Cancellation & Refunds</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                Cancellation policies vary depending on the specific property and the rate type selected at the time of booking.
              </p>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 my-6">
                <h4 className="font-bold text-gray-900 mb-3 text-xl">Standard Policy Framework:</h4>
                <ul className="space-y-3 text-gray-600 list-disc pl-5">
                  <li><strong>Free Cancellation:</strong> Available on select rates if cancelled up to 48 hours before check-in.</li>
                  <li><strong>Non-Refundable:</strong> Certain discounted rates may not be eligible for any refunds upon cancellation.</li>
                  <li><strong>No-Shows:</strong> Failure to arrive at the property without prior cancellation will result in a 100% penalty charge (no refund).</li>
                </ul>
              </div>
            </section>

            <section id="payments" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">5. Payments & Transactions</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                We utilize industry-standard encryption protocols to ensure that your payment data is 100% secure.
              </p>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-6">
                <li>By providing a payment method, you represent and warrant that you are authorized to use the designated payment method.</li>
                <li>You authorize us (or our third-party payment processors) to charge your payment method for the total amount of your booking, including applicable taxes and fees.</li>
                <li>In local currencies, exchange rates are determined at the time of the transaction.</li>
              </ul>
            </section>

            <section id="responsibilities" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">6. User Responsibilities & Prohibited Activities</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                When using Stayzium, you agree not to:
              </p>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-6">
                <li>Use the platform for any illegal purpose or in violation of any local, state, national, or international law.</li>
                <li>Make fraudulent, speculative, or false reservations.</li>
                <li>Interfere with security-related features of the platform, including reverse engineering or attempting to extract source code.</li>
                <li>Submit false, defamatory, or abusive reviews or content regarding properties.</li>
              </ul>
            </section>

            <section id="liability" className="scroll-mt-28 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">7. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                To the maximum extent permitted by law, Stayzium, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-6">
                <li>Your access to or use of or inability to access or use the Service;</li>
                <li>Any conduct or content of any third party on the Service;</li>
                <li>Any unauthorized access, use, or alteration of your transmissions or content.</li>
              </ul>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Terms;
