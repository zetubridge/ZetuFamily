import { initializeFirebase } from "./services/firebase";
import { 
  Developer, 
  InsertDeveloper, 
  App, 
  InsertApp, 
  UpdateApp, 
  Payment, 
  InsertPayment 
} from "@shared/schema";
import bcrypt from "bcrypt";

export interface IStorage {
  // Developer methods
  createDeveloper(developer: InsertDeveloper): Promise<Developer>;
  getDeveloperByEmail(email: string): Promise<Developer | null>;
  getDeveloperById(id: string): Promise<Developer | null>;
  verifyDeveloper(email: string, password: string): Promise<Developer | null>;
  
  // App methods
  createApp(app: InsertApp): Promise<App>;
  getAppById(id: string): Promise<App | null>;
  getPublishedApps(): Promise<App[]>;
  getAppsByDeveloper(developerId: string): Promise<App[]>;
  getAllApps(): Promise<App[]>;
  updateApp(id: string, updates: UpdateApp): Promise<App | null>;
  updateAppStatus(id: string, status: "pending" | "published" | "rejected"): Promise<App | null>;
  incrementDownloads(id: string): Promise<void>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentById(id: string): Promise<Payment | null>;
  getPaymentByReference(reference: string): Promise<Payment | null>;
  updatePaymentStatus(id: string, status: "pending" | "completed" | "failed"): Promise<Payment | null>;
}

export class FirebaseStorage implements IStorage {
  private db: any;

  constructor() {
    const { db } = initializeFirebase();
    this.db = db;
  }

  // Developer methods
  async createDeveloper(developer: InsertDeveloper): Promise<Developer> {
    const hashedPassword = await bcrypt.hash(developer.password, 10);
    const id = this.db.collection('developers').doc().id;
    
    const newDeveloper: Developer = {
      ...developer,
      id,
      password: hashedPassword,
      createdAt: new Date(),
      isVerified: false,
    };

    await this.db.collection('developers').doc(id).set(newDeveloper);
    return newDeveloper;
  }

  async getDeveloperByEmail(email: string): Promise<Developer | null> {
    const snapshot = await this.db.collection('developers').where('email', '==', email).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Developer;
  }

  async getDeveloperById(id: string): Promise<Developer | null> {
    const doc = await this.db.collection('developers').doc(id).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() } as Developer;
  }

  async verifyDeveloper(email: string, password: string): Promise<Developer | null> {
    const developer = await this.getDeveloperByEmail(email);
    
    if (!developer) return null;
    
    const isValidPassword = await bcrypt.compare(password, developer.password);
    
    if (!isValidPassword) return null;
    
    return developer;
  }

  // App methods
  async createApp(app: InsertApp): Promise<App> {
    const id = this.db.collection('apps').doc().id;
    
    const newApp: App = {
      ...app,
      id,
      status: "pending",
      rating: 0,
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: "pending",
    };

    await this.db.collection('apps').doc(id).set(newApp);
    return newApp;
  }

  async getAppById(id: string): Promise<App | null> {
    const doc = await this.db.collection('apps').doc(id).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() } as App;
  }

  async getPublishedApps(): Promise<App[]> {
    try {
      const snapshot = await this.db.collection('apps')
        .where('status', '==', 'published')
        .get();
      
      const apps = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      // Sort in memory since Firestore ordering may require composite index
      return apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting published apps:', error);
      // Return empty array if there's an error (no apps yet)
      return [];
    }
  }

  async getAppsByDeveloper(developerId: string): Promise<App[]> {
    const snapshot = await this.db.collection('apps')
      .where('developerId', '==', developerId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async getAllApps(): Promise<App[]> {
    const snapshot = await this.db.collection('apps')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async updateApp(id: string, updates: UpdateApp): Promise<App | null> {
    const updatedData = {
      ...updates,
      updatedAt: new Date(),
    };

    await this.db.collection('apps').doc(id).update(updatedData);
    return this.getAppById(id);
  }

  async updateAppStatus(id: string, status: "pending" | "published" | "rejected"): Promise<App | null> {
    await this.db.collection('apps').doc(id).update({
      status,
      updatedAt: new Date(),
    });
    
    return this.getAppById(id);
  }

  async incrementDownloads(id: string): Promise<void> {
    const appRef = this.db.collection('apps').doc(id);
    await appRef.update({
      downloads: this.db.FieldValue.increment(1),
      updatedAt: new Date(),
    });
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.db.collection('payments').doc().id;
    
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date(),
    };

    await this.db.collection('payments').doc(id).set(newPayment);
    return newPayment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const doc = await this.db.collection('payments').doc(id).get();
    
    if (!doc.exists) return null;
    
    return { id: doc.id, ...doc.data() } as Payment;
  }

  async getPaymentByReference(reference: string): Promise<Payment | null> {
    const snapshot = await this.db.collection('payments').where('paystackReference', '==', reference).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Payment;
  }

  async updatePaymentStatus(id: string, status: "pending" | "completed" | "failed"): Promise<Payment | null> {
    const updateData: any = {
      status,
    };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    await this.db.collection('payments').doc(id).update(updateData);
    return this.getPaymentById(id);
  }
}

// Switch to Firebase now that database is set up
export const storage = new FirebaseStorage();
