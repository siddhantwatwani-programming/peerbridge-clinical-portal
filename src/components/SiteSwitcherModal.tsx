import React from 'react';
import { Building, Check, MapPin, Users, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSite } from '@/contexts/SiteContext';
import { cn } from '@/lib/utils';

interface SiteSwitcherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteSwitcherModal({ open, onOpenChange }: SiteSwitcherModalProps) {
  const { sites, currentSite, memberships, switchSite } = useSite();

  const handleSiteSelect = (siteId: string) => {
    switchSite(siteId);
    onOpenChange(false);
  };

  const getRoleName = (siteId: string): string => {
    const membership = memberships.find(m => m.site_id === siteId);
    return membership?.role?.name || 'Member';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Switch Client Site
          </DialogTitle>
          <DialogDescription>
            Select a site to switch your context. Your session will be preserved.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4 -mr-4">
          <div className="space-y-2">
            {sites.map((site) => {
              const isActive = currentSite?.id === site.id;
              const roleName = getRoleName(site.id);

              return (
                <button
                  key={site.id}
                  onClick={() => handleSiteSelect(site.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all duration-200',
                    'hover:border-primary/50 hover:bg-primary/5',
                    isActive
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
                      : 'border-border bg-card'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {site.name}
                        </h3>
                        {isActive && (
                          <Badge variant="default" className="shrink-0 bg-primary text-primary-foreground">
                            <Check className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>

                      {site.address && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{site.address}</span>
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {roleName}
                        </Badge>
                      </div>
                    </div>

                    <ChevronRight className={cn(
                      'h-5 w-5 text-muted-foreground transition-colors',
                      isActive && 'text-primary'
                    )} />
                  </div>
                </button>
              );
            })}

            {sites.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No Sites Available</p>
                <p className="text-sm mt-1">
                  You don't have access to any sites yet.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
