import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaVideo, FaUserCircle } from 'react-icons/fa';

function HomePage() {
  return (
    <div className="text-center bg-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Section with Animation */}
      <div className="animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
          Your Health, <span className="text-primary">Our Priority.</span> <br /> 
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Connect with Doctors Online.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          MediCose provides a seamless platform for online doctor consultations and appointment bookings. 
          Find the right specialist for your needs, anytime, anywhere.
        </p>

        {/* Call to Action Buttons with Hover Animations */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link 
            to="/doctors" 
            className="btn-primary flex items-center px-6 py-3 text-lg rounded-lg transition-all 
                      duration-300 shadow-md hover:scale-105 hover:shadow-lg transform-gpu"
          >
            <FaSearch className="h-5 w-5 mr-2" /> Find a Doctor
          </Link>
          <Link 
            to="/register" 
            className="btn-secondary bg-gradient-to-r from-gray-700 to-gray-600 text-white 
                      flex items-center justify-center px-6 py-3 text-lg rounded-lg transition-all 
                      duration-300 hover:scale-105 hover:shadow-lg transform-gpu"
          >
            <FaUserCircle className="h-5 w-5 mr-2" /> Register Now
          </Link>
        </div>
      </div>

      {/* Features Section with Staggered Animations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            icon: <FaSearch className="h-12 w-12 text-primary mx-auto mb-4" />,
            title: "Search & Filter",
            desc: "Easily find doctors by specialization, location, availability, and ratings."
          },
          {
            icon: <FaCalendarAlt className="h-12 w-12 text-primary mx-auto mb-4" />,
            title: "Book Appointments",
            desc: "Schedule appointments with real-time availability and secure payments."
          },
          {
            icon: <FaVideo className="h-12 w-12 text-primary mx-auto mb-4" />,
            title: "Video Consultations",
            desc: "Connect with doctors securely via integrated video calls from anywhere."
          }
        ].map((feature, index) => (
          <div 
            key={index}
            className={`bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 
                       hover:-translate-y-2 border border-gray-100 animate-fade-in-up delay-${index + 1}00`}
          >
            <div className="animate-bounce-slow">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works Section */}
      <div className="mt-20 animate-fade-in">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">
          How It <span className="text-primary">Works</span>
        </h2>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 -z-10"></div>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-4 lg:space-x-12">
            {[
              { step: "1", text: "Find a Doctor" },
              { step: "2", text: "Book & Pay" },
              { step: "3", text: "Consult Online" },
              { step: "4", text: "Get Prescription" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="bg-primary text-white rounded-full h-14 w-14 flex items-center justify-center 
                              text-2xl font-bold mb-4 transition-all duration-300 group-hover:scale-110 
                              group-hover:shadow-lg transform-gpu">
                  {item.step}
                </div>
                <p className="text-lg font-medium text-gray-700">{item.text}</p>
                {index < 3 && (
                  <div className="text-gray-300 text-4xl hidden md:block animate-pulse-slow">→</div>
                )}
                {index === 3 && (
                  <div className="text-gray-300 text-4xl hidden md:block animate-pulse-slow">✔️</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section (Optional) */}
      <div className="mt-24 animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          What Our <span className="text-primary">Patients Say</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              quote: "Saved me hours of waiting at the clinic. The video consultation was seamless!",
              author: "Sarah Johnson"
            },
            {
              quote: "Found the perfect specialist for my condition in minutes. Highly recommend!",
              author: "Michael Chen"
            },
            {
              quote: "The prescription was sent directly to my pharmacy. So convenient!",
              author: "Emma Rodriguez"
            }
          ].map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-gray-600 italic mb-4">"{testimonial.quote}"</div>
              <div className="text-gray-900 font-medium">— {testimonial.author}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;