import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Photo, SlotCropConfig } from "@/types";
import { clampOffset } from "@/utils/cropUtils";

interface CropPositionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: Photo;
  cropConfig: SlotCropConfig;
  slotAspect: number;
  onUpdate: (updates: Partial<SlotCropConfig>) => void;
}

export function CropPositionEditor({
  open,
  onOpenChange,
  photo,
  cropConfig,
  slotAspect,
  onUpdate,
}: CropPositionEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localOffset, setLocalOffset] = useState({
    x: cropConfig.offsetX,
    y: cropConfig.offsetY,
  });

  // Sync local offset when crop config changes (intentional prop-to-state sync for controlled input)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalOffset({ x: cropConfig.offsetX, y: cropConfig.offsetY });
  }, [cropConfig.offsetX, cropConfig.offsetY]);

  // Determine which axis can be panned
  const photoAspect = photo.aspectRatio;
  const canPanX = photoAspect > slotAspect;
  const canPanY = photoAspect < slotAspect;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (cropConfig.objectFit === "contain") return;
      e.preventDefault();
      setIsDragging(true);
    },
    [cropConfig.objectFit]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const sensitivity = 0.01;

      setLocalOffset((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (canPanX) {
          newX = clampOffset(prev.x - e.movementX * sensitivity);
        }
        if (canPanY) {
          newY = clampOffset(prev.y - e.movementY * sensitivity);
        }

        return { x: newX, y: newY };
      });
    },
    [isDragging, canPanX, canPanY]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onUpdate({ offsetX: localOffset.x, offsetY: localOffset.y });
    }
  }, [isDragging, localOffset, onUpdate]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleReset = () => {
    setLocalOffset({ x: 0, y: 0 });
    onUpdate({ offsetX: 0, offsetY: 0 });
  };

  // Calculate preview styles
  const getPreviewStyles = (): React.CSSProperties => {
    if (cropConfig.objectFit === "contain") {
      return {
        width: "100%",
        height: "100%",
        objectFit: "contain",
      };
    }

    const posX = 50 + localOffset.x * 50;
    const posY = 50 + localOffset.y * 50;

    return {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: `${posX}% ${posY}%`,
    };
  };

  const canDrag = cropConfig.objectFit === "cover" && (canPanX || canPanY);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust Crop Position</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-lg bg-black"
            style={{ aspectRatio: slotAspect }}
            onMouseDown={handleMouseDown}
          >
            <img
              src={photo.url}
              alt=""
              draggable={false}
              style={getPreviewStyles()}
              className={canDrag ? "cursor-move" : ""}
            />

            {/* Drag hint overlay */}
            {canDrag && !isDragging && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                  Drag to adjust
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-muted-foreground text-sm">
            {cropConfig.objectFit === "contain" ? (
              <p>
                The full image is shown. Switch to Cover mode to enable
                cropping.
              </p>
            ) : canDrag ? (
              <p>
                Drag the image to adjust which part is visible.
                {canPanX && " Pan left/right."}
                {canPanY && " Pan up/down."}
              </p>
            ) : (
              <p>This image fits the slot perfectly - no adjustment needed.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={
                cropConfig.objectFit === "contain" ||
                (localOffset.x === 0 && localOffset.y === 0)
              }
            >
              Reset to Center
            </Button>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
