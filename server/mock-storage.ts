import { IStorage } from './storage';
import { Developer, InsertDeveloper, App, InsertApp, UpdateApp, Payment, InsertPayment } from '../shared/schema';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export class MockStorage implements IStorage {
  private developers: Developer[] = [];
  private apps: App[] = [];
  private payments: Payment[] = [];

  constructor() {
    this.seedMockData();
  }

  private async seedMockData() {
    // Create developer
    const developer = await this.createDeveloper({
      email: 'developer@med-a.com',
      name: 'MED-A Team',
      company: 'Medical Education Solutions',
      password: 'password123'
    });

    // Create MED-A app
    const medAApp = await this.createApp({
      name: 'MED-A',
      description: 'Welcome to MED-A! Your go-to app for accessing past exam papers from Kenya Medical Training College (KMTC). Whether you\'re a KMTC student or enrolled in a private institution offering courses like nursing and more, MED-A is here to support your studies with valuable resources to help you succeed. Start exploring and enhance your learning experience today!',
      category: 'Medical Education',
      logoUrl: 'https://via.placeholder.com/120x120/4F46E5/ffffff?text=MED-A',
      downloadUrl: 'https://example.com/download/med-a.apk',
      screenshots: [
        'https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+1',
        'https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+2',
        'https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+3',
        'https://via.placeholder.com/400x600/4F46E5/ffffff?text=Screenshot+4'
      ],
      developerId: developer.id,
      developerName: developer.name
    });

    // Update to published
    await this.updateApp(medAApp.id, {
      status: 'published',
      rating: 4.8,
      downloads: 1250,
      paymentStatus: 'completed'
    });
  }

  async createDeveloper(developer: InsertDeveloper): Promise<Developer> {
    const hashedPassword = await bcrypt.hash(developer.password, 10);
    const newDeveloper: Developer = {
      id: nanoid(),
      email: developer.email,
      name: developer.name,
      company: developer.company,
      password: hashedPassword,
      createdAt: new Date(),
      isVerified: true
    };
    this.developers.push(newDeveloper);
    return newDeveloper;
  }

  async getDeveloperByEmail(email: string): Promise<Developer | null> {
    return this.developers.find(dev => dev.email === email) || null;
  }

  async getDeveloperById(id: string): Promise<Developer | null> {
    return this.developers.find(dev => dev.id === id) || null;
  }

  async verifyDeveloper(email: string, password: string): Promise<Developer | null> {
    const developer = await this.getDeveloperByEmail(email);
    if (!developer) return null;
    
    const isValid = await bcrypt.compare(password, developer.password);
    return isValid ? developer : null;
  }

  async createApp(app: InsertApp): Promise<App> {
    const newApp: App = {
      id: nanoid(),
      name: app.name,
      description: app.description,
      category: app.category,
      logoUrl: app.logoUrl,
      downloadUrl: app.downloadUrl,
      screenshots: app.screenshots,
      developerId: app.developerId,
      developerName: app.developerName,
      status: 'pending',
      paymentStatus: 'pending',
      rating: 0,
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.apps.push(newApp);
    return newApp;
  }

  async getAppById(id: string): Promise<App | null> {
    return this.apps.find(app => app.id === id) || null;
  }

  async getPublishedApps(): Promise<App[]> {
    return this.apps.filter(app => app.status === 'published');
  }

  async getAppsByDeveloper(developerId: string): Promise<App[]> {
    return this.apps.filter(app => app.developerId === developerId);
  }

  async getAllApps(): Promise<App[]> {
    return this.apps;
  }

  async updateApp(id: string, updates: UpdateApp): Promise<App | null> {
    const index = this.apps.findIndex(app => app.id === id);
    if (index === -1) return null;
    
    this.apps[index] = {
      ...this.apps[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.apps[index];
  }

  async updateAppStatus(id: string, status: "pending" | "published" | "rejected"): Promise<App | null> {
    return this.updateApp(id, { status });
  }

  async incrementDownloads(id: string): Promise<void> {
    const app = await this.getAppById(id);
    if (app) {
      await this.updateApp(id, { downloads: app.downloads + 1 });
    }
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const newPayment: Payment = {
      id: nanoid(),
      appId: payment.appId,
      developerId: payment.developerId,
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.reference,
      status: payment.status,
      paystackReference: payment.paystackReference,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.push(newPayment);
    return newPayment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.payments.find(payment => payment.id === id) || null;
  }

  async getPaymentByReference(reference: string): Promise<Payment | null> {
    return this.payments.find(payment => payment.reference === reference) || null;
  }

  async updatePaymentStatus(id: string, status: "pending" | "completed" | "failed"): Promise<Payment | null> {
    const index = this.payments.findIndex(payment => payment.id === id);
    if (index === -1) return null;
    
    this.payments[index] = {
      ...this.payments[index],
      status,
      updatedAt: new Date()
    };
    return this.payments[index];
  }
}