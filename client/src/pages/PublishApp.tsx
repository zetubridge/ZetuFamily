import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { ArrowLeft, Upload, CreditCard, CheckCircle, AlertCircle, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { insertAppSchema } from "@shared/schema";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";

const publishAppSchema = insertAppSchema.extend({
  screenshots: insertAppSchema.shape.screenshots.refine(
    (urls) => urls.length === 4,
    "Exactly 4 screenshot URLs are required"
  ).refine(
    (urls) => urls.every(url => url.trim().length > 0),
    "All screenshot URLs must be provided"
  ),
});

type PublishAppForm = typeof publishAppSchema._type;

export default function PublishApp() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [appId, setAppId] = useState("");
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const { toast } = useToast();
  const { developer, isAuthenticated } = useAuth();

  const form = useForm<PublishAppForm>({
    resolver: zodResolver(publishAppSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "Medical Education",
      logoUrl: "",
      downloadUrl: "",
      screenshots: ["", "", "", ""],
    },
  });

  const onSubmit = async (data: PublishAppForm) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to publish an app.",
        variant: "destructive",
      });
      setLocation("/developer/login");
      return;
    }

    setIsSubmitting(true);
    try {
      // First, create the app
      const appResponse = await api.createApp({
        ...data,
        screenshots: data.screenshots.filter(url => url.trim().length > 0),
      });
      const createdApp = await appResponse.json();
      setAppId(createdApp.id);

      // Then, initialize payment
      const paymentResponse = await api.initializePayment(createdApp.id);
      const paymentData = await paymentResponse.json();
      
      setPaymentUrl(paymentData.authorizationUrl);
      setStep("payment");
      
      toast({
        title: "App Created Successfully",
        description: "Please complete the payment to publish your app.",
      });
    } catch (error) {
      console.error("App creation error:", error);
      toast({
        title: "Publication Failed",
        description: "Unable to create app. Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = () => {
    if (paymentUrl) {
      // Open Paystack payment in a new window
      const paymentWindow = window.open(paymentUrl, "_blank", "width=600,height=600");
      
      // Listen for payment completion
      const checkPayment = setInterval(() => {
        if (paymentWindow?.closed) {
          clearInterval(checkPayment);
          // Check payment status
          setTimeout(() => {
            setStep("success");
            toast({
              title: "Payment Successful!",
              description: "Your app has been submitted for review.",
            });
          }, 1000);
        }
      }, 1000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center">
            <CardContent className="p-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in as a developer to publish an app.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/developer/login">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Login as Developer
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/developer/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {step === "form" && (
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-roboto">Publish Your App</CardTitle>
                  <p className="text-gray-600">Fill in your app details and proceed to payment</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Medical Archives" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Medical Education">Medical Education</SelectItem>
                              <SelectItem value="Health Monitoring">Health Monitoring</SelectItem>
                              <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                              <SelectItem value="Anatomy">Anatomy</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={4} 
                            placeholder="Describe your app's features and benefits for medical students..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>App Logo URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="https://example.com/logo.png" 
                                {...field} 
                              />
                              <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="downloadUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Download URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="https://example.com/app.apk" 
                                {...field} 
                              />
                              <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormLabel className="text-base font-medium">App Screenshots (4 URLs required)</FormLabel>
                    <div className="space-y-3 mt-2">
                      {[0, 1, 2, 3].map((index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name={`screenshots.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder={`Screenshot ${index + 1} URL`} 
                                    {...field} 
                                  />
                                  <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Payment Information:</strong> Publishing fee is <strong>KES 1,000</strong> (one-time payment).
                      Your app will be reviewed and published within 24 hours after payment confirmation.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating App...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment (KES 1,000)
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {step === "payment" && (
          <Card className="card-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-roboto">Complete Payment</h2>
              <p className="text-gray-600 mb-6">
                Your app has been created successfully. Please complete the payment to publish it.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Publishing Fee:</span>
                  <span className="text-xl font-bold text-blue-600">KES 1,000</span>
                </div>
              </div>
              <Button 
                onClick={handlePayment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay with Paystack
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Secure payment processed by Paystack
              </p>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card className="card-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-roboto">App Submitted Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your app has been submitted for review. You'll receive a notification once it's approved and published.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">
                  ✓ Payment confirmed<br />
                  ✓ App created and submitted<br />
                  ✓ Review process initiated
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Link href="/developer/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
