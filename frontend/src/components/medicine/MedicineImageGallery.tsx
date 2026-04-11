import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MedicineImageGalleryProps {
  images: string[]
  medicineName: string
}

export const MedicineImageGallery = ({ images, medicineName }: MedicineImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
    setZoomLevel(1)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
    setZoomLevel(1)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3))
    setIsZoomed(true)
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1))
    if (zoomLevel <= 1.5) setIsZoomed(false)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square bg-secondary/10 rounded-lg overflow-hidden group">
          <img
            src={images[selectedIndex]}
            alt={`${medicineName} - Vue ${selectedIndex + 1}`}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            )}
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={() => setIsFullscreen(true)}
          />
          
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleZoomIn()
              }}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleZoomOut()
              }}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index)
                  setZoomLevel(1)
                  setIsZoomed(false)
                }}
                className={cn(
                  "aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                  selectedIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={image}
                  alt={`${medicineName} - Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative w-full h-[90vh] bg-black">
            <img
              src={images[selectedIndex]}
              alt={`${medicineName} - Vue ${selectedIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 bg-background/20 backdrop-blur-sm text-white hover:bg-background/40"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation in Fullscreen */}
            {images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 backdrop-blur-sm text-white hover:bg-background/40"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 backdrop-blur-sm text-white hover:bg-background/40"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                
                {/* Counter in Fullscreen */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {selectedIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
