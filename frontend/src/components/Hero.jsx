import React from 'react'
import { Link } from 'react-router-dom'
import heroBg from './assets/hero-bg.jpg';
const Hero = () => {
  return (
    <>
        <section className="relative bg-gradient-to-r from-emerald-500 to-teal-700 py-24">
        <div
            className="absolute inset-0 opacity-20"
            style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
            }}
        ></div>
        <div className="container mx-auto px-4 relative">
            <div className="max-w-2xl text-center mx-auto">
            <h1 className="text-5xl font-bold text-white mb-6">Find Your Dream Home</h1>
            <p className="text-xl text-white/90 mb-8">Discover the perfect property with our extensive listings and expert guidance.</p>
            <div className="flex justify-center space-x-4">
                <Link to="/properties" className="px-6 py-3 bg-white text-emerald-600 font-medium rounded-md hover:bg-emerald-800 transition-colors">
                Browse Properties
                </Link>
                <Link to="/contact" className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors">
                Contact Agent
                </Link>
            </div>
            </div>
        </div>
      </section>
    </>
    
  )
}

export default Hero