import Hero from '../components/Hero';
import FeaturedPropertiesCarousel from '../components/FeaturedPropertiesCarousel';
import WhyChooseUs from '../components/WhyChooseUs';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import ChatBotv2 from '../components/ChatBotv2';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />

      {/* Featured Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <FeaturedPropertiesCarousel />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <WhyChooseUs />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <CallToAction />
        </div>
      </section>
      <ChatBotv2 />
      <Footer />
    </>
  );
};

export default Home;