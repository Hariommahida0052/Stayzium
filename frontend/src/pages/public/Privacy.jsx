import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { Shield, Database, Users, Eye, Lock, Globe } from 'lucide-react';

const Privacy = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: '1. Introduction', icon: <Globe className="w-5 h-5" /> },
    { id: 'collection', title: '2. Information We Collect', icon: <Database className="w-5 h-5" /> },
    { id: 'usage', title: '3. How We Use Data', icon: <Eye className="w-5 h-5" /> },
    { id: 'sharing', title: '4. Data Sharing', icon: <Users className="w-5 h-5" /> },
    { id: 'security', title: '5. Data Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'rights', title: '6. Your Privacy Rights', icon: <Shield className="w-5 h-5" /> },
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Privacy Policy</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your privacy is our priority. Learn how Stayzium collects, uses, and protects your personal information.
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
            
            <section id="introduction" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                At Stayzium, we care deeply about privacy. We believe in transparency, and we’re committed to being upfront about our privacy practices, including how we treat your personal information.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                This Privacy Policy explains how Stayzium Inc. ("we", "us", or "our") collects, uses, shares, and protects information in relation to our booking platform and services.
              </p>
            </section>

            <section id="collection" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">2. Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                We collect information you provide directly to us, information we collect automatically, and information from third parties.
              </p>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 my-6">
                <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-5">
                  <li><strong>Account Information:</strong> Name, email address, phone number, and encrypted password.</li>
                  <li><strong>Booking Details:</strong> Travel dates, destinations, guest details, and special requests.</li>
                  <li><strong>Payment Data:</strong> Billing address and payment method details (processed securely by our PCI-compliant partners).</li>
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
                </ul>
              </div>
            </section>

            <section id="usage" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">3. How We Use Data</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-6">
                <li>To facilitate and process your bookings and transactions.</li>
                <li>To provide customer support and respond to inquiries.</li>
                <li>To send administrative messages, booking confirmations, and travel updates.</li>
                <li>To improve and optimize our platform, ensuring a better user experience.</li>
                <li>To detect and prevent fraud, spam, and abuse.</li>
              </ul>
            </section>

            <section id="sharing" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">4. Data Sharing & Third-Parties</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                We do not sell your personal data. We only share information in the following circumstances:
              </p>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-6">
                <li><strong>With Hotel Partners:</strong> We share necessary details (name, booking dates, special requests) with the property you booked to fulfill the reservation.</li>
                <li><strong>Service Providers:</strong> We employ trusted third-party companies to facilitate our service (e.g., payment gateways, cloud hosting).</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or subpoena.</li>
              </ul>
            </section>

            <section id="security" className="scroll-mt-28 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">5. Data Security</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                Stayzium implements robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We utilize SSL/TLS encryption for data transmission and employ advanced firewalls and monitoring tools across our infrastructure.
              </p>
            </section>

            <section id="rights" className="scroll-mt-28 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">6. Your Privacy Rights</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                Depending on your location (such as under GDPR or CCPA), you have the right to:
              </p>
              <ul className="space-y-4 text-gray-600 leading-relaxed text-lg list-disc pl-6">
                <li>Request access to the personal data we hold about you.</li>
                <li>Request correction of inaccurate or incomplete data.</li>
                <li>Request deletion of your personal data ("Right to be Forgotten").</li>
                <li>Opt-out of marketing communications at any time.</li>
              </ul>
              <p className="text-gray-600 leading-relaxed text-lg mt-6">
                To exercise any of these rights, please contact us at <strong>privacy@stayzium.com</strong>.
              </p>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Privacy;
