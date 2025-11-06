'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Info, TrendingUp, Gift } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CreditsDisplayProps {
  creditsBalance: number;
  hasUsedFreeTrial: boolean;
  isSubscribed: boolean;
  weeklyCreditsLimit?: number;
  onSubscribeClick?: () => void;
}

export default function CreditsDisplay({
  creditsBalance,
  hasUsedFreeTrial,
  isSubscribed,
  weeklyCreditsLimit = 3,
  onSubscribeClick,
}: CreditsDisplayProps) {
  const hasFreeTrial = !isSubscribed && !hasUsedFreeTrial && creditsBalance > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Your Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credits Balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available Credits:</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{creditsBalance}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Credits can be used to access job leads without paying per job.
                    {hasFreeTrial && ' You have 1 free trial credit (valid for small jobs only).'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Free Trial Badge */}
        {hasFreeTrial && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Gift className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">Free Trial Credit</p>
                <p className="text-xs text-green-700 mt-1">
                  You have 1 free credit to try our platform! This credit can only be used for
                  <span className="font-semibold"> SMALL jobs</span>.
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Commission still applies when you complete the job.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status */}
        {isSubscribed ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">Subscribed</Badge>
              <span className="text-sm font-medium">Active Subscription</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You receive {weeklyCreditsLimit} credits weekly
            </p>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-900">No Active Subscription</p>
                <p className="text-xs text-orange-700 mt-1">
                  Subscribe to get weekly credits and access all job sizes
                </p>
              </div>
              {onSubscribeClick && (
                <Button size="sm" onClick={onSubscribeClick}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Subscribe
                </Button>
              )}
            </div>
          </div>
        )}

        {/* How Credits Work */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-2">How Credits Work:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 1 credit = Access to 1 job lead</li>
            <li>• Free trial credit: SMALL jobs only</li>
            <li>• Subscription credits: All job sizes</li>
            <li>• Commission applies when using credits</li>
            <li>• Alternative: Pay per job without subscription</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

