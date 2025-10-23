import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import TeamCard from "../components/TeamCard";
import ChatBotv2 from "../components/ChatBotv2";

const About = () => (
  <>
  <Navbar />
  <div className="container mx-auto px-4 py-16">
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4 text-emerald-700">About NES Properties</h1>
      <p className="text-lg text-gray-600 mb-8">
        <b><i>NES Properties</i></b> stands for <b>Next Evolution of System</b> - a dedicated platform helping USAS students find suitable accommodation in Kuala Kangsar. Our innovative <b>Virtual-Tour</b> technology allows students to explore properties in <b>360-degree view</b> without leaving campus. Our AI assistant provides 24/7 support to answer questions about available properties.
      </p>
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-emerald-600 mb-2">Our Mission</h2>
          <p className="text-gray-500">To provide our customer specially students in USAS to find rental houses around Kuala Kangsar which is near University.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-emerald-600 mb-2">Our Vision</h2>
          <p className="text-gray-500">To be the leading real estate agency known for innovation, customer care, and outstanding results.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-emerald-600 mb-2">Our Values</h2>
          <ul className="text-gray-500 list-disc list-inside">
            <li>Integrity & Trust</li>
            <li>Customer Focus</li>
            <li>Innovation</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <TeamCard />
  <ChatBotv2 />
  <Footer />

  </>
);

export default About;