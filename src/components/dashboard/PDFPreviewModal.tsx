import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
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
  Maximize2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const pdfUrl = '/reports/sample-report.pdf';

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
  };

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
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${reportId}.pdf`;
    link.click();
  };

  const handlePrint = () => {
    window.open(pdfUrl, '_blank');
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(2.5, prev + 0.25));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.25));
  };

  const rotateClockwise = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotation(prev => (prev - 90 + 360) % 360);
  };

  const zoomPercent = Math.round(scale * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">PDF Report Preview</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* PDF Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#323639] text-white flex-shrink-0">
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 bg-white/10 rounded px-2 py-1">
              <input
                type="text"
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value) || 1;
                  setCurrentPage(Math.min(numPages, Math.max(1, page)));
                }}
                className="w-8 text-center bg-transparent border-none text-white text-sm focus:outline-none"
              />
              <span className="text-white/60 text-sm">/ {numPages}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Zoom Controls */}
            <div className="h-4 w-px bg-white/20 mx-2" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="bg-accent text-white text-sm px-2 py-1 rounded min-w-[50px] text-center">
              {zoomPercent}%
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={zoomIn}
              disabled={scale >= 2.5}
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={rotateCounterClockwise}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={rotateClockwise}
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            {/* Download & Print */}
            <div className="h-4 w-px bg-white/20 mx-2" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={handleDownloadAll}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/10"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 bg-[#525659] overflow-auto flex items-start justify-center p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-white gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Loading PDF...</span>
            </div>
          )}
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="flex justify-center"
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              rotate={rotation}
              className="shadow-xl"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleDownloadAll}>
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
