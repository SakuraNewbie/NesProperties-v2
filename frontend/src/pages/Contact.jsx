import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ContactForm from "../components/ContactForm";
import ContactInfo from "../components/ContactInfo";
import ChatBotv2 from "../components/ChatBotv2";

const Contact = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">Get In Touch</h1>
            <p className="text-lg text-gray-700">
              Have questions about a property? Want to schedule a viewing? 
              Our team is here to help you every step of the way.
            </p>
          </div>
        </div>
      </div>
      
      {/* Contact Layout */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Left side - Contact form */}
          <ContactForm />
          
          {/* Right side - Contact information */}
          <ContactInfo />
        </div>
      </div>
      
      {/* Map Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-5xl mx-auto">
            {/* This would be your Google Maps integration */}
            <div className="h-96 bg-gray-200 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.971189142264!2d101.6942113!3d3.1516964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc37d12d669bf9%3A0x9e3afdd17c8a9056!2sKuala%20Lumpur%20City%20Centre!5e0!3m2!1sen!2smy!4v1651234567890!5m2!1sen!2smy" 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="NES Properties office location"
              ></iframe>
              <div className="absolute bottom-4 left-4 bg-emerald-600 text-white py-2 px-4 rounded-lg shadow-md">
                <p className="font-medium">NES Properties Headquarters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: "What are your office hours?",
                a: "Our offices are open Monday to Friday from 9:00 AM to 6:00 PM, and Saturdays from 10:00 AM to 4:00 PM. We're closed on Sundays and public holidays."
              },
              {
                q: "How can I schedule a property viewing?",
                a: "You can schedule a property viewing by filling out our contact form, calling our office directly, or using the chat assistant on our website. Our team will get back to you within 24 hours to confirm your appointment."
              },
              {
                q: "Do you offer virtual property tours?",
                a: "Yes, we offer virtual 360° property tours for most of our listings. You can view these on our property details pages or request a live virtual tour with one of our agents."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <ChatBotv2 />
      <Footer />
    </>
  );
};

export default Contact;