'use client';

import { InfoIcon, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export function CommissionExplanation({ isSubscribed = false }: { isSubscribed?: boolean }) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {isSubscribed ? 
            "Your Subscription Includes 5% Commission" : 
            "Non-Subscribed Job Access"}
        </CardTitle>
        <CardDescription>
          {isSubscribed ? 
            "Understanding how our subscription and commission system works" : 
            "How job access works for non-subscribed contractors"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubscribed ? (
          <>
            <Alert className="border-primary bg-primary/10">
              <InfoIcon className="h-4 w-4 text-primary" />
              <AlertTitle>Subscription Benefits</AlertTitle>
              <AlertDescription className="mt-2">
                With your active subscription, you have two options: Use your free weekly credits (5% commission after job completion), 
                or pay the lead price upfront to avoid any commission fees.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4 mt-4">
              <h3 className="font-medium">Your Two Options:</h3>
              
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 mb-4">
                <h4 className="font-medium text-green-800 mb-1">Option 1: Use Weekly Credits (5% Commission)</h4>
                <p className="text-sm text-green-700">Use your 3 free weekly credits to access jobs. Pay 5% commission only after job completion.</p>
              </div>
              
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 mb-4">
                <h4 className="font-medium text-blue-800 mb-1">Option 2: Pay Lead Price (0% Commission)</h4>
                <p className="text-sm text-blue-700">Pay the lead price upfront and keep 100% of your earnings - no commission at all!</p>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="font-medium">How Commission Works (When Using Credits):</h3>
              
              <div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
                <span className="bg-primary/20 rounded-full w-5 h-5 flex items-center justify-center text-xs text-primary font-bold mt-0.5">1</span>
                <p className="text-sm">You complete the job and enter the final amount.</p>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
                <span className="bg-primary/20 rounded-full w-5 h-5 flex items-center justify-center text-xs text-primary font-bold mt-0.5">2</span>
                <p className="text-sm">The customer confirms job completion.</p>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
                <span className="bg-primary/20 rounded-full w-5 h-5 flex items-center justify-center text-xs text-primary font-bold mt-0.5">3</span>
                <p className="text-sm">A 5% commission on the final amount is calculated (+ VAT).</p>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
                <span className="bg-primary/20 rounded-full w-5 h-5 flex items-center justify-center text-xs text-primary font-bold mt-0.5">4</span>
                <p className="text-sm">You&apos;ll receive a notification with payment details.</p>
              </div>
              
              <div className="grid grid-cols-[20px_1fr] gap-x-2 items-start">
                <span className="bg-primary/20 rounded-full w-5 h-5 flex items-center justify-center text-xs text-primary font-bold mt-0.5">5</span>
                <p className="text-sm">Payment must be completed within 48 hours.</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="font-medium mb-2">Example Commission Calculation:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Final Job Amount:</span>
                <span className="font-medium">£1,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Commission Rate:</span>
                <span>5%</span>
              </div>
              <div className="flex justify-between">
                <span>Commission Amount:</span>
                <span>£50.00</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (20%):</span>
                <span>£10.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Due:</span>
                <span>£60.00</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Non-Subscribed Access</AlertTitle>
              <AlertDescription className="mt-2">
                As a non-subscribed contractor, you pay upfront to access job leads, but no commission is charged after job completion.
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-[24px_1fr] gap-x-3 items-start">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <h4 className="font-medium">No Commission</h4>
                    <p className="text-sm text-muted-foreground">You keep 100% of the final job amount - no commission deducted.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-[24px_1fr] gap-x-3 items-start">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <h4 className="font-medium">Upfront Payment</h4>
                    <p className="text-sm text-muted-foreground">You must pay the full job access price upfront (£15-£50 per job).</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-[24px_1fr] gap-x-3 items-start">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <h4 className="font-medium">No Free Job Credits</h4>
                    <p className="text-sm text-muted-foreground">You don't receive any subscription benefits or job credits.</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <h4 className="font-medium mb-2">Want Subscription Benefits?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Switch to our subscription model for access to all jobs with just a 5% commission on completed jobs.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
