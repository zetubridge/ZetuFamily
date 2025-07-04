import { storage } from './storage';

async function seedDatabase() {
  try {
    console.log('Starting database seed...');
    
    // Create a developer account for MED-A
    const developer = await storage.createDeveloper({
      email: 'developer@med-a.com',
      name: 'MED-A Team',
      company: 'Medical Education Solutions',
      password: 'password123'
    });
    
    console.log('Created developer:', developer.id);
    
    // Create the MED-A app
    const medAApp = await storage.createApp({
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
    
    console.log('Created MED-A app:', medAApp.id);
    
    // Update the app to published status with some stats
    await storage.updateApp(medAApp.id, {
      status: 'published',
      rating: 4.8,
      downloads: 1250,
      paymentStatus: 'completed'
    });
    
    console.log('Updated MED-A app to published status');
    console.log('Database seed completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export { seedDatabase };

// Run if called directly
seedDatabase();