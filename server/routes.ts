import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { paystackService } from "./services/paystack";
import { 
  insertDeveloperSchema, 
  loginDeveloperSchema, 
  insertAppSchema, 
  updateAppSchema,
  insertPaymentSchema 
} from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.developerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Developer Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertDeveloperSchema.parse(req.body);
      
      // Check if developer already exists
      const existingDeveloper = await storage.getDeveloperByEmail(validatedData.email);
      if (existingDeveloper) {
        return res.status(400).json({ message: 'Developer already exists with this email' });
      }

      const developer = await storage.createDeveloper(validatedData);
      
      // Don't send password back
      const { password, ...developerWithoutPassword } = developer;
      
      res.status(201).json(developerWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginDeveloperSchema.parse(req.body);
      
      const developer = await storage.verifyDeveloper(email, password);
      
      if (!developer) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.developerId = developer.id;
      
      const { password: _, ...developerWithoutPassword } = developer;
      
      res.json(developerWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Invalid login data' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
    try {
      const developer = await storage.getDeveloperById(req.session.developerId);
      
      if (!developer) {
        return res.status(404).json({ message: 'Developer not found' });
      }

      const { password, ...developerWithoutPassword } = developer;
      res.json(developerWithoutPassword);
    } catch (error) {
      console.error('Get developer error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // App Routes
  app.get('/api/apps', async (req, res) => {
    try {
      const apps = await storage.getPublishedApps();
      res.json(apps);
    } catch (error) {
      console.error('Get apps error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/apps/:id', async (req, res) => {
    try {
      const app = await storage.getAppById(req.params.id);
      
      if (!app) {
        return res.status(404).json({ message: 'App not found' });
      }

      res.json(app);
    } catch (error) {
      console.error('Get app error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/apps/:id/download', async (req, res) => {
    try {
      await storage.incrementDownloads(req.params.id);
      res.json({ message: 'Download recorded' });
    } catch (error) {
      console.error('Download increment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/developer/apps', requireAuth, async (req: any, res) => {
    try {
      const apps = await storage.getAppsByDeveloper(req.session.developerId);
      res.json(apps);
    } catch (error) {
      console.error('Get developer apps error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/apps', requireAuth, async (req: any, res) => {
    try {
      const developer = await storage.getDeveloperById(req.session.developerId);
      
      if (!developer) {
        return res.status(404).json({ message: 'Developer not found' });
      }

      const validatedData = insertAppSchema.parse({
        ...req.body,
        developerId: developer.id,
        developerName: developer.name,
      });

      const app = await storage.createApp(validatedData);
      res.status(201).json(app);
    } catch (error) {
      console.error('Create app error:', error);
      res.status(400).json({ message: 'Invalid app data' });
    }
  });

  app.put('/api/apps/:id', requireAuth, async (req: any, res) => {
    try {
      const app = await storage.getAppById(req.params.id);
      
      if (!app) {
        return res.status(404).json({ message: 'App not found' });
      }

      if (app.developerId !== req.session.developerId) {
        return res.status(403).json({ message: 'Not authorized to update this app' });
      }

      const validatedData = updateAppSchema.parse(req.body);
      const updatedApp = await storage.updateApp(req.params.id, validatedData);
      
      res.json(updatedApp);
    } catch (error) {
      console.error('Update app error:', error);
      res.status(400).json({ message: 'Invalid app data' });
    }
  });

  // Payment Routes
  app.post('/api/payments/initialize', requireAuth, async (req: any, res) => {
    try {
      const { appId } = req.body;
      
      const app = await storage.getAppById(appId);
      if (!app) {
        return res.status(404).json({ message: 'App not found' });
      }

      if (app.developerId !== req.session.developerId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const developer = await storage.getDeveloperById(req.session.developerId);
      if (!developer) {
        return res.status(404).json({ message: 'Developer not found' });
      }

      const reference = `app_${appId}_${nanoid(10)}`;
      const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/payment/callback`;

      // Initialize payment with Paystack
      const paymentResponse = await paystackService.initializePayment(
        developer.email,
        1000, // KES 1,000
        reference,
        callbackUrl
      );

      if (!paymentResponse.status) {
        return res.status(400).json({ message: 'Payment initialization failed' });
      }

      // Store payment record
      const payment = await storage.createPayment({
        appId,
        developerId: developer.id,
        amount: 1000,
        currency: 'KES',
        status: 'pending',
        paystackReference: reference,
      });

      res.json({
        paymentId: payment.id,
        authorizationUrl: paymentResponse.data.authorization_url,
        reference: paymentResponse.data.reference,
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { reference } = req.body;
      
      // Verify payment with Paystack
      const verificationResponse = await paystackService.verifyPayment(reference);
      
      if (!verificationResponse.status) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }

      const payment = await storage.getPaymentByReference(reference);
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      if (verificationResponse.data.status === 'success') {
        await storage.updatePaymentStatus(payment.id, 'completed');
        
        // Update app payment status
        await storage.updateApp(payment.appId, {
          paymentStatus: 'completed',
        });

        res.json({ 
          message: 'Payment verified successfully',
          status: 'success',
          payment: payment
        });
      } else {
        await storage.updatePaymentStatus(payment.id, 'failed');
        
        res.json({ 
          message: 'Payment verification failed',
          status: 'failed'
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin Routes (for app approval)
  app.get('/api/admin/apps', async (req, res) => {
    try {
      const apps = await storage.getAllApps();
      res.json(apps);
    } catch (error) {
      console.error('Get all apps error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/admin/apps/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['pending', 'published', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const app = await storage.updateAppStatus(req.params.id, status);
      
      if (!app) {
        return res.status(404).json({ message: 'App not found' });
      }

      res.json(app);
    } catch (error) {
      console.error('Update app status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
