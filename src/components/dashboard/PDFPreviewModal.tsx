import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Menu,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Download,
  Printer,
  MoreVertical,
  FileText,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  studyType: string;
  reportId?: string;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  patientName,
  studyType,
  reportId = '988f43f2-3c4c-a1b9-abde-0268013908bc'
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const totalPages = 12;

  const handlePhysicianInterpretation = () => {
    onClose();
    navigate('/interpretation', { 
      state: { 
        patientName, 
        studyType,
        reportId,
        showPdfPreview: true 
      } 
    });
  };

  const handleDownloadAll = () => {
    // Download functionality placeholder
    console.log('Downloading all reports...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">PDF Report Preview</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* PDF Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#323639] text-white">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <Menu className="h-4 w-4" />
            </Button>
            <span className="text-sm text-white/80 truncate max-w-[300px]">
              {reportId}.pdf
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Page Navigation */}
            <div className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
              <input
                type="text"
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-8 text-center bg-transparent border-none text-white text-sm focus:outline-none"
              />
              <span className="text-white/60 text-sm">/ {totalPages}</span>
            </div>

            {/* Zoom Controls */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => setZoom(Math.max(50, zoom - 25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="bg-accent text-white text-sm px-2 py-1 rounded min-w-[50px] text-center">
              {zoom}%
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {/* View Controls */}
            <div className="h-4 w-px bg-white/20 mx-2" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* Rotate Controls */}
            <div className="h-4 w-px bg-white/20 mx-2" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <RotateCw className="h-4 w-4" />
            </Button>

            {/* Download & Print */}
            <div className="h-4 w-px bg-white/20 mx-2" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content Area - Mock Clinical Report */}
        <div className="flex-1 bg-[#525659] overflow-auto p-6">
          <div 
            className="bg-white mx-auto shadow-lg"
            style={{ 
              width: `${8.5 * zoom / 100 * 96}px`,
              minHeight: `${11 * zoom / 100 * 96}px`,
              padding: '40px'
            }}
          >
            {/* Report Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <span className="text-2xl font-bold text-[#1D2B44]">CorXT</span>
                </div>
                <p className="text-accent font-semibold text-sm">COMPLETE RETROSPECTIVE ANALYSIS</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Peerbridge Health Inc, 3 Columbus Circle, 15th Floor, New York City, NY 10019
                </p>
                <p className="text-xs text-muted-foreground">877 426-7457</p>
              </div>
              <div className="text-right">
                <div className="bg-muted px-3 py-1 rounded inline-block mb-2">
                  <span className="text-sm font-medium">(29 yrs, M)</span>
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>Study Duration</strong></p>
                  <p>Start: 12/4/2025 03:34 PM</p>
                  <p>End: 12/11/2025 03:12 PM</p>
                  <p>Total: 6d 23h 38m</p>
                </div>
              </div>
            </div>

            {/* Patient Info Row */}
            <div className="grid grid-cols-5 gap-4 text-xs mb-6 border-t border-b border-border py-3">
              <div>
                <p className="text-muted-foreground">Patient MRN</p>
                <div className="bg-muted h-4 w-20 rounded mt-1" />
              </div>
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="font-medium">Male</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date Of Birth</p>
                <div className="bg-muted h-4 w-16 rounded inline-block" />
                <span className="ml-2">(29 years)</span>
              </div>
              <div>
                <p className="text-muted-foreground">Report Edited by</p>
                <p className="font-medium">J.B., CRAT</p>
              </div>
              <div>
                <p className="text-muted-foreground">Analyzable Time</p>
                <p className="font-medium">6d 23h 38m (100.00%)</p>
              </div>
            </div>

            {/* Beat Type & Rhythm Distribution */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-sm border-b border-border pb-1 mb-2">Beat Type Summary</h3>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span>Normal</span><span>(100.0%)</span></div>
                  <div className="flex justify-between"><span>BBB</span><span>(0.0%)</span></div>
                  <div className="flex justify-between"><span>VE</span><span>(0.0%)</span></div>
                  <div className="flex justify-between"><span>SV/Atrial</span><span>(0.0%)</span></div>
                  <div className="flex justify-between"><span>Nodal</span><span>(0.0%)</span></div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm border-b border-border pb-1 mb-2">Rhythm Distribution</h3>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span>Sinus (60-100)</span><span>(60.65%)</span></div>
                  <div className="flex justify-between"><span>Sinus (&gt;100)</span><span>(15.49%)</span></div>
                  <div className="flex justify-between"><span>Sinus (&lt;60)</span><span>(23.85%)</span></div>
                  <div className="flex justify-between"><span>AF/AFL (60-100)</span><span>(0%)</span></div>
                  <div className="flex justify-between"><span>AF/AFL (&gt;100)</span><span>(0%)</span></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Heart Rate</h3>
                  <span className="text-xs text-muted-foreground">(Pg. 02)</span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <div><span className="text-muted-foreground">Max</span> <strong>194</strong></div>
                  <div><span className="text-muted-foreground">Min</span> <strong>49</strong></div>
                  <div><span className="text-muted-foreground">Average</span> <strong>79</strong></div>
                </div>
                {/* Mock ECG trend line */}
                <div className="h-16 bg-muted/30 rounded border border-border flex items-center justify-center">
                  <svg viewBox="0 0 200 40" className="w-full h-10">
                    <path 
                      d="M0,20 L20,20 L25,10 L30,30 L35,5 L40,35 L45,20 L60,20 L65,15 L70,25 L75,20 L100,20 L105,10 L110,30 L115,5 L120,35 L125,20 L140,20 L145,12 L150,28 L155,20 L200,20" 
                      fill="none" 
                      stroke="#F05A28" 
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Ventricular Ectopy Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm">VENTRICULAR ECTOPY</h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs">Total: 1 (0%)</span>
                  <span className="text-xs text-muted-foreground">(Pg. 05)</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-xs text-center mb-2">
                <div><p className="text-muted-foreground">Singles</p><p className="font-medium">1</p></div>
                <div><p className="text-muted-foreground">Couplets</p><p className="font-medium">0</p></div>
                <div><p className="text-muted-foreground">Triplets</p><p className="font-medium">0</p></div>
                <div><p className="text-muted-foreground">Runs</p><p className="font-medium">0</p></div>
                <div><p className="text-muted-foreground">Fastest</p><p className="font-medium">0 bpm</p></div>
                <div><p className="text-muted-foreground">Longest</p><p className="font-medium">0 beats</p></div>
                <div><p className="text-muted-foreground">Bigeminy</p><p className="font-medium">0</p></div>
              </div>
              {/* Mock ECG strip */}
              <div className="h-20 bg-muted/20 rounded border border-border flex items-center justify-center">
                <svg viewBox="0 0 400 50" className="w-full h-12">
                  <path 
                    d="M0,25 L30,25 L35,25 L40,10 L45,40 L50,5 L55,45 L60,25 L90,25 L95,25 L100,10 L105,40 L110,5 L115,45 L120,25 L150,25 L155,25 L160,10 L165,40 L170,5 L175,45 L180,25 L210,25 L215,25 L220,10 L225,40 L230,5 L235,45 L240,25 L270,25 L275,25 L280,10 L285,40 L290,5 L295,45 L300,25 L330,25 L335,25 L340,10 L345,40 L350,5 L355,45 L360,25 L400,25" 
                    fill="none" 
                    stroke="#1D2B44" 
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-card">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleDownloadAll}>
            Download All (2)
          </Button>
          <Button variant="accent" onClick={handlePhysicianInterpretation}>
            Physician Interpretation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
