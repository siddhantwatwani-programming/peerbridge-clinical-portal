import React, { useState, useEffect } from 'react';
import { Sparkles, Battery, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeviceRecommendation {
  recommendedDevice: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    device: string;
    reason: string;
  }>;
  warnings?: string[];
}

interface SmartDeviceRecommendationProps {
  studyType: string;
  orderType: 'clinic' | 'home' | null;
  patientName: string;
  onSelectDevice: (deviceTag: string) => void;
}

// Mock device data - in production this would come from the inventory
const availableDevices = [
  { tag: '3Y34NYQ9S74', battery: 92, expiresIn: 14, lastUsed: '2025-01-15' },
  { tag: '4X45MZR0T85', battery: 78, expiresIn: 45, lastUsed: '2025-01-20' },
  { tag: '5W56LYS1U96', battery: 95, expiresIn: 7, lastUsed: '2025-01-10' },
  { tag: '6V67KXR2V07', battery: 65, expiresIn: 90, lastUsed: '2025-01-22' },
];

export const SmartDeviceRecommendation: React.FC<SmartDeviceRecommendationProps> = ({
  studyType,
  orderType,
  patientName,
  onSelectDevice
}) => {
  const [recommendation, setRecommendation] = useState<DeviceRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async () => {
    if (!studyType || !orderType) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('smart-device-assignment', {
        body: {
          studyType,
          orderType,
          patientName,
          availableDevices
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setRecommendation(data);
    } catch (err) {
      console.error('Error fetching device recommendation:', err);
      setError('Failed to get AI recommendation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studyType && orderType) {
      fetchRecommendation();
    }
  }, [studyType, orderType]);

  const handleSelectDevice = (deviceTag: string) => {
    onSelectDevice(deviceTag);
    toast.success(`Device ${deviceTag} selected`);
  };

  if (!studyType || !orderType) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-accent mr-2" />
          <span className="text-sm text-muted-foreground">AI analyzing device options...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !recommendation) {
    return null;
  }

  const recommendedDevice = availableDevices.find(d => d.tag === recommendation.recommendedDevice);

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          AI Device Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommended Device */}
        <div className="p-4 bg-card rounded-lg border-2 border-accent/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="font-medium">Recommended: {recommendation.recommendedDevice}</span>
            </div>
            <Badge className="bg-accent/10 text-accent">
              {recommendation.confidence}% match
            </Badge>
          </div>

          {recommendedDevice && (
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Battery</p>
                  <Progress value={recommendedDevice.battery} className="h-1.5 mt-1" />
                  <p className="text-xs font-medium">{recommendedDevice.battery}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Expires In</p>
                  <p className="text-sm font-medium">{recommendedDevice.expiresIn} days</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-3">{recommendation.reasoning}</p>

          <Button 
            variant="accent" 
            size="sm" 
            className="w-full"
            onClick={() => handleSelectDevice(recommendation.recommendedDevice)}
          >
            Use This Device
          </Button>
        </div>

        {/* Warnings */}
        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <div className="space-y-2">
            {recommendation.warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <p className="text-xs text-warning">{warning}</p>
              </div>
            ))}
          </div>
        )}

        {/* Alternatives */}
        {recommendation.alternatives && recommendation.alternatives.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Alternatives</p>
            {recommendation.alternatives.map((alt, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{alt.device}</p>
                  <p className="text-xs text-muted-foreground">{alt.reason}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSelectDevice(alt.device)}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
