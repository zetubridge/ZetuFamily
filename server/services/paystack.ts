import https from 'https';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    status: string;
    paid_at: string;
    customer: {
      email: string;
    };
  };
}

export class PaystackService {
  private makeRequest(path: string, data?: any, method: string = 'GET'): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path,
        method,
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async initializePayment(email: string, amount: number, reference: string, callbackUrl: string): Promise<PaystackInitializeResponse> {
    const data = {
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      currency: 'KES',
      callback_url: callbackUrl,
    };

    return this.makeRequest('/transaction/initialize', data, 'POST');
  }

  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    return this.makeRequest(`/transaction/verify/${reference}`);
  }
}

export const paystackService = new PaystackService();
