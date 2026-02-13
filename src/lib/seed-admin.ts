import { db } from '@/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

/**
 * Run this function once to seed your first admin user.
 * You can call this from the browser console or a temporary button.
 */
export async function seedFirstAdmin(email: string) {
  try {
    const normalizedEmail = email.toLowerCase();
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('email', '==', normalizedEmail));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      console.log(`⚠️ Admin ${normalizedEmail} already exists.`);
      return;
    }

    await addDoc(adminsRef, {
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
      role: 'super_admin'
    });
    
    console.log(`✅ Successfully added admin: ${normalizedEmail}`);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
}
