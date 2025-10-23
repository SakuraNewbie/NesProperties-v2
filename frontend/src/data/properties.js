import oneImg from '../components/assets/images/property1.jpg';
import twoImg from '../components/assets/images/property2.jpg';
import threeImg from '../components/assets/images/property3.jpeg';
import fourImg from '../components/assets/images/property4.jpg';
import fiveImg from '../components/assets/images/property5.jpg';
import sixImg from '../components/assets/images/panorama/6.jpg';

//property-1
import property1Interior1 from '../components/assets/images/interior/property1-interior1.jpg';
import property1Interior2 from '../components/assets/images/interior/property1-interior2.jpg';
import property1Interior3 from '../components/assets/images/interior/property1-interior3.jpg';
import property1Interior4 from '../components/assets/images/interior/property1-interior4.jpg';

//property-2
import property2Interior1 from '../components/assets/images/interior/property2-interior1.jpg';
import property2Interior2 from '../components/assets/images/interior/property2-interior2.jpg';
import property2Interior3 from '../components/assets/images/interior/property2-interior3.jpg';

//property-3  // Fixed typo
import property3Interior1 from '../components/assets/images/interior/property3-interior1.jpeg';
import property3Interior2 from '../components/assets/images/interior/property3-interior2.jpeg';
import property3Interior3 from '../components/assets/images/interior/property3-interior3.jpeg';

//property-4
import property4Interior1 from '../components/assets/images/interior/property4-interior1.jpg';
import property4Interior2 from '../components/assets/images/interior/property4-interior2.jpg';

//property-5
import property5Interior1 from '../components/assets/images/interior/property5-interior1.jpg';
import property5Interior2 from '../components/assets/images/interior/property5-interior2.jpg';
import property5Interior3 from '../components/assets/images/interior/property5-interior3.jpg';

// Import map data
import { propertyMaps } from './mapLinks';

// Add price unit indicator
export const PRICE_UNIT = 'monthly';

// Add owner data
export const propertyOwners = [
  {
    id: 1,
    name: 'Ahmad Zulkifli',
    phone: '012-345-6789',
    email: 'ahmad.zulkifli@example.com'
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    phone: '011-2233-4455',
    email: 'siti.nurhaliza@example.com'
  },
  {
    id: 3,
    name: 'Raj Kumar',
    phone: '019-876-5432',
    email: 'raj.kumar@example.com'
  },
  {
    id: 4,
    name: 'Tan Wei Ming',
    phone: '017-889-3344',
    email: 'tan.weiming@example.com'
  },
  {
    id: 5,
    name: 'Sarah Abdullah',
    phone: '013-777-9900',
    email: 'sarah.abdullah@example.com'
  }
];

export const allProperties = [
  {
    id: 1,
    title: 'House for rent in Taman Jati Fasa 2 only for girls',
    location: 'Bukit Chandan',
    price: 270,
    priceUnit: 'monthly',
    bedrooms: 3,
    bathrooms: 2,
    area: 800,
    image: oneImg,
    images: [
      oneImg,
      property1Interior1,
      property1Interior2,
      property1Interior3,
      property1Interior4
    ],
    type: '2-Storey Terrace',
    featured: true,
    // Added structured attributes
    description: 'Spacious 3-bedroom house in Taman Jati Fasa 2, perfect for female students. Features 2 bathrooms, fully equipped kitchen, and is located within walking distance to local amenities.',
    forStudents: true,
    gender: 'female',
    priceCategory: 'medium',
    nearbyFacilities: ['Shopping Mall', 'Public Transport', 'School'],
    available: true,
    availableFrom: '2025-06-01',
    // Reference the map data
    mapData: propertyMaps[1],
    // Add owner reference
    ownerId: 1
  },
  {
    id: 2,
    title: 'House for rent in Taman Sentosa',
    location: 'Taman Sentosa',
    price: 120,
    priceUnit: 'monthly',
    bedrooms: 3,
    bathrooms: 2,
    area: 260,
    image: twoImg,
    images: [
      twoImg,
      property2Interior1,
      property2Interior2,
      property2Interior3
    ],
    type: 'Semi-D',
    featured: true,
    description: 'Affordable 3-bedroom semi-detached house in Taman Sentosa. This property offers comfortable living space with 2 bathrooms and good access to local facilities.',
    forStudents: false,
    gender: null, // Available to any gender
    priceCategory: 'budget',
    nearbyFacilities: ['Market', 'Restaurant', 'Park'],
    available: true,
    availableFrom: '2025-06-15',
    mapData: propertyMaps[2],
    // Add owner reference
    ownerId: 2
  },
  {
    id: 3,
    title: 'House for rent USAS girls student only',
    location: 'Chandan Puteri',
    price: 280,
    priceUnit: 'monthly',
    bedrooms: 4,
    bathrooms: 3,
    area: 700,
    image: threeImg,
    images: [
      threeImg,
      property3Interior1,
      property3Interior2,
      property3Interior3
    ],
    type: '1-Storey Terrace',
    featured: true,
    description: 'Spacious 4-bedroom house exclusively for female USAS students. Featuring 3 bathrooms and a large living area. Convenient location close to USAS campus.',
    forStudents: true,
    gender: 'female',
    priceCategory: 'medium',
    nearbyFacilities: ['USAS Campus', 'Convenience Store', 'Cafe'],
    available: true,
    availableFrom: '2025-07-01',
    mapData: propertyMaps[3],
    // Add owner reference
    ownerId: 3
  },
  {
    id: 4,
    title: 'House for rent near USAS only for men',
    location: 'Chandan Puteri',
    price: 150,
    priceUnit: 'monthly',
    bedrooms: 3,
    bathrooms: 2,
    area: 550,
    image: fourImg,
    images: [
      fourImg,
      property4Interior1,
      property4Interior2
    ],
    type: '1-Storey Terrace',
    featured: false,
    description: 'Comfortable 3-bedroom house near USAS campus available exclusively for male students. Features 2 bathrooms and is within walking distance to campus facilities.',
    forStudents: true,
    gender: 'male',
    priceCategory: 'budget',
    nearbyFacilities: ['USAS Campus', 'Sports Complex', 'Mini Market'],
    available: true,
    availableFrom: '2025-06-10',
    mapData: propertyMaps[4],
    // Add owner reference
    ownerId: 4
  },
  {
    id: 5,
    title: 'House for rent only for men',
    location: 'Taman Sultan Yusuf',
    price: 275,
    priceUnit: 'monthly',
    bedrooms: 3,
    bathrooms: 2,
    area: 600,
    image: fiveImg,
    images: [
      fiveImg,
      property5Interior1,
      property5Interior2,
      property5Interior3
    ],
    type: '2-Storey Terrace',
    featured: false,
    description: 'Modern 3-bedroom, 2-story terrace house in Taman Sultan Yusuf available for male tenants. Well-maintained with 2 bathrooms and spacious living areas.',
    forStudents: false,
    gender: 'male',
    priceCategory: 'medium',
    nearbyFacilities: ['Mosque', 'Shopping Center', 'Restaurant'],
    available: true,
    availableFrom: '2025-07-15',
    mapData: propertyMaps[5],
    // Add owner reference
    ownerId: 5
  },
  {
    id: 6,
    title: 'Modern House for Rent in Taman Kopeka',
    location: 'Taman Kopeka',
    price: 495, // Fixed price inconsistency
    priceUnit: 'monthly',
    bedrooms: 4,
    bathrooms: 3,
    area: 1100,
    image: sixImg,
    images: [
      sixImg
    ],
    type: '2-Storey Terrace',
    featured: false,
    description: 'Spacious 4-bedroom terrace house in Taman Kopeka with modern facilities. Features 3 bathrooms, large living area, and is suitable for families or groups.',
    forStudents: false,
    gender: null, // Available to any gender
    priceCategory: 'premium',
    nearbyFacilities: ['School', 'Hospital', 'Shopping Mall'],
    available: true,
    availableFrom: '2025-08-01',
    mapData: propertyMaps[6],
    // Add owner reference
    ownerId: 1
  }
];

// Get owner information by property
export const getPropertyOwner = (propertyId) => {
  const property = allProperties.find(p => p.id === parseInt(propertyId));
  if (!property) return null;
  
  return propertyOwners.find(owner => owner.id === property.ownerId) || null;
};

// Export a helper function to get property by ID
export const getPropertyById = (id) => {
  return allProperties.find(property => property.id === parseInt(id)) || null;
};

// Export filters for common queries
export const propertyFilters = {
  forStudents: () => allProperties.filter(p => p.forStudents),
  forFemales: () => allProperties.filter(p => p.gender === 'female'),
  forMales: () => allProperties.filter(p => p.gender === 'male'),
  featured: () => allProperties.filter(p => p.featured),
  byPriceRange: (min, max) => allProperties.filter(p => p.price >= min && p.price <= max),
  byLocation: (location) => {
    const locationPattern = new RegExp(location, 'i');
    return allProperties.filter(p => locationPattern.test(p.location));
  }
};