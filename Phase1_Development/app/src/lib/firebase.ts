import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Product } from './types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(doc => ({
    id: Number(doc.id),
    ...doc.data()
  })) as Product[];
}

export async function getProductById(id: number): Promise<Product | null> {
  const docRef = doc(db, 'products', String(id));
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id, ...snapshot.data() } as Product;
  }
  return null;
}

export async function addProduct(product: Omit<Product, 'id'> & { id?: number }): Promise<number> {
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);
  const newId = product.id || (snapshot.docs.length > 0 
    ? Math.max(...snapshot.docs.map(d => Number(d.id))) + 1 
    : 1);
  
  await setDoc(doc(db, 'products', String(newId)), {
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description
  });
  
  return newId;
}

export async function deleteProduct(id: number): Promise<void> {
  await deleteDoc(doc(db, 'products', String(id)));
}

export { db };
