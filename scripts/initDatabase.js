// Database initialization script for SAMB's Laundry App
// Run this script to populate your Firestore database with initial data

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAsej8UqUcBSSLFpPLBi74uFa5ei87rJ4",
  authDomain: "fir-1e69a.firebaseapp.com",
  projectId: "fir-1e69a",
  storageBucket: "fir-1e69a.firebasestorage.app",
  messagingSenderId: "281189391358",
  appId: "1:281189391358:web:611dc2dd7d3e2751e97eaf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial services data
const initialServices = [
  {
    name: "Wash & Fold",
    description: "Professional washing and folding service for everyday clothes",
    category: "laundry",
    price: 15,
    unit: "kg",
    estimatedTime: "24 hours",
    image: "wash-fold.jpg",
    available: true
  },
  {
    name: "Dry Cleaning",
    description: "Premium dry cleaning for delicate garments and formal wear",
    category: "dry-cleaning",
    price: 25,
    unit: "item",
    estimatedTime: "48 hours",
    image: "dry-clean.jpg",
    available: true
  },
  {
    name: "Ironing Service",
    description: "Professional ironing for all types of clothing",
    category: "ironing",
    price: 8,
    unit: "kg",
    estimatedTime: "12 hours",
    image: "ironing.jpg",
    available: true
  },
  {
    name: "Express Laundry",
    description: "Same-day laundry service for urgent needs",
    category: "express",
    price: 30,
    unit: "kg",
    estimatedTime: "6 hours",
    image: "express.jpg",
    available: true
  },
  {
    name: "Wedding Dress Cleaning",
    description: "Specialized cleaning for wedding dresses and formal gowns",
    category: "specialized",
    price: 150,
    unit: "item",
    estimatedTime: "72 hours",
    image: "wedding.jpg",
    available: true
  },
  {
    name: "Shoe Cleaning",
    description: "Professional cleaning and polishing for all types of shoes",
    category: "specialized",
    price: 12,
    unit: "pair",
    estimatedTime: "24 hours",
    image: "shoes.jpg",
    available: true
  },
  {
    name: "Curtain Cleaning",
    description: "Deep cleaning service for curtains and drapes",
    category: "household",
    price: 35,
    unit: "set",
    estimatedTime: "48 hours",
    image: "curtains.jpg",
    available: true
  },
  {
    name: "Comforter Cleaning",
    description: "Specialized cleaning for comforters and duvets",
    category: "household",
    price: 45,
    unit: "item",
    estimatedTime: "72 hours",
    image: "comforter.jpg",
    available: true
  }
];

// Initialize services
async function initializeServices() {
  try {
    console.log('Starting to add services...');
    
    for (const service of initialServices) {
      await addDoc(collection(db, 'services'), {
        ...service,
        createdAt: serverTimestamp()
      });
      console.log(`Added service: ${service.name}`);
    }
    
    console.log('All services added successfully!');
  } catch (error) {
    console.error('Error adding services:', error);
  }
}

// Run the initialization
initializeServices().then(() => {
  console.log('Database initialization completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});
