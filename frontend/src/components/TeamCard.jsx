import React from 'react';
import TeamLeader from './assets/images/team-leader.jpg'; // Placeholder for team leader image
import TeamAssisstant from './assets/images/team-assistant.jpg'; // Placeholder for team assistant image

// Create a separate component for individual team members
const TeamMember = ({ image, name, role, bio, linkedin, twitter, email }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 flex flex-col h-full">
    {/* Image container with gradient overlay */}
    <div className="relative h-72 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover object-center"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/400x500?text=Team+Member";
        }}
      />
      <div className="absolute bottom-0 left-0 p-6 z-20 w-full text-center">
        <h3 className="text-2xl font-bold text-white">{name}</h3>
        <p className="text-emerald-300 font-medium">{role}</p>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-6 flex-1 flex flex-col">
      <p className="text-gray-600 mb-4 text-center flex-1">{bio}</p>
      
      {/* Social links */}
      <div className="flex justify-center space-x-4 pt-3 mt-auto">
        {linkedin && (
          <a 
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-100 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors"
            aria-label={`${name}'s LinkedIn profile`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        )}
        
        {twitter && (
          <a 
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gray-100 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors"
            aria-label={`${name}'s Twitter profile`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
        )}
        
        {email && (
          <a 
            href={`mailto:${email}`}
            className="p-2 bg-gray-100 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors"
            aria-label={`Email ${name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </a>
        )}
      </div>
    </div>
  </div>
);

// Main TeamCard component that renders all team members
const TeamCard = () => {
  // Team data defined inside the component
  const teamMembers = [
    {
      id: 1,
      name: "Haziq Irfan",
      role: "Team Leader",
      bio: "Work smart not work hard.",
      image: TeamLeader,
      linkedin: "https://linkedin.com/in/haziqirfan",
      email: "haziq@nesproperties.com"
    },
    {
      id: 2,
      name: "Akmal Zuhairie",
      role: "Team Assistant",
      bio: "Make it simple follow the flow.",
      image: TeamAssisstant,
      linkedin: "https://linkedin.com/in/akmalzuhairie",
      email: "akmalzuhairie@nesproperties.com"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-emerald-700 mb-4">Meet Our Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our dedicated professionals are committed to providing the best property experience through innovation and personalized service.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {teamMembers.map(member => (
            <TeamMember 
              key={member.id}
              image={member.image} 
              name={member.name} 
              role={member.role} 
              bio={member.bio}
              linkedin={member.linkedin} 
              twitter={member.twitter} 
              email={member.email} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamCard;