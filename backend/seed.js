const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load models
const User = require('./models/User');
const Owner = require('./models/Owner');
const Property = require('./models/Property');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nes-properties')
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const users = [
  {
    username: 'admin',
    email: 'admin@nesProperties.com',
    password: 'admin123',
    fullName: 'System Administrator',
    role: 'admin'
  },
  {
    username: 'owner1',
    email: 'ahmad@example.com',
    password: 'password123',
    fullName: 'Ahmad Zulkifli',
    role: 'owner'
  },
  {
    username: 'owner2',
    email: 'siti@example.com',
    password: 'password123',
    fullName: 'Siti Nurhaliza',
    role: 'owner'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'password123',
    fullName: 'John Doe',
    role: 'user'
  }
];

const owners = [
  {
    fullName: 'Ahmad Zulkifli',
    phone: '012-345-6789',
    email: 'ahmad@example.com'
  },
  {
    fullName: 'Siti Nurhaliza',
    phone: '011-2233-4455',
    email: 'siti@example.com'
  }
];

const properties = [
  {
    title: 'House for rent in Taman Jati Fasa 2 only for girls',
    location: {
      area: 'Bukit Chandan',
      fullAddress: '123 Jalan Jati, Taman Jati Fasa 2, Kuala Kangsar',
      distanceToUSAS: 2.5
    },
    price: 270,
    bedrooms: 3,
    rooms: 3,
    bathrooms: 2,
    squareFeet: 800,
    type: 'Terrace',
    description: 'Spacious 3-bedroom house in Taman Jati Fasa 2, perfect for female students.',
    genderRestriction: 'female_only',
    amenities: ['wifi', 'air_conditioning', 'washing_machine'],
    images: [
      'https://example.com/images/property1.jpg',
      'https://example.com/images/property1-interior1.jpg'
    ],
    featured: true
  },
  {
    title: 'House for rent in Taman Sentosa',
    location: {
      area: 'Taman Sentosa',
      fullAddress: '45 Jalan Sentosa, Taman Sentosa, Kuala Kangsar',
      distanceToUSAS: 3.2
    },
    price: 120,
    bedrooms: 3,
    rooms: 3,
    bathrooms: 2,
    squareFeet: 260,
    type: 'Semi-D',
    description: 'Affordable 3-bedroom semi-detached house in Taman Sentosa.',
    genderRestriction: 'none',
    amenities: ['parking', 'security'],
    images: [
      'https://example.com/images/property2.jpg',
      'https://example.com/images/property2-interior1.jpg'
    ],
    featured: true
  },
  {
    title: 'House for rent USAS girls student only',
    location: {
      area: 'Chandan Puteri',
      fullAddress: '78 Jalan CP 3, Chandan Puteri, Kuala Kangsar',
      distanceToUSAS: 1.5
    },
    price: 280,
    bedrooms: 4,
    rooms: 4,
    bathrooms: 3,
    squareFeet: 700,
    type: 'Terrace',
    description: 'Spacious 4-bedroom house exclusively for female USAS students.',
    genderRestriction: 'female_only',
    amenities: ['wifi', 'air_conditioning', 'study_desk', 'refrigerator'],
    images: [
      'https://example.com/images/property3.jpg'
    ],
    featured: true
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Owner.deleteMany({});
    await Property.deleteMany({});
    
    console.log('Database cleared');
    
    // Create users with hashed passwords
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const createdUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(createdUser);
    }
    
    console.log('Users created:', createdUsers.length);
    
    // Create owners and link to user accounts
    const createdOwners = [];
    for (let i = 0; i < owners.length; i++) {
      const ownerUser = createdUsers.find(u => u.email === owners[i].email);
      
      if (ownerUser) {
        const createdOwner = await Owner.create({
          ...owners[i],
          userId: ownerUser._id
        });
        
        createdOwners.push(createdOwner);
      }
    }
    
    console.log('Owners created:', createdOwners.length);
    
    // Create properties linked to owners
    const createdProperties = [];
    for (let i = 0; i < properties.length; i++) {
      // Assign properties to owners alternately
      const ownerIndex = i % createdOwners.length;
      
      const createdProperty = await Property.create({
        ...properties[i],
        owner: createdOwners[ownerIndex]._id
      });
      
      // Add property to owner's properties list
      await Owner.findByIdAndUpdate(
        createdOwners[ownerIndex]._id,
        { $push: { properties: createdProperty._id } }
      );
      
      createdProperties.push(createdProperty);
    }
    
    console.log('Properties created:', createdProperties.length);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();
