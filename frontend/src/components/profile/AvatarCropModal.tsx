"use client";

import React, { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move } from "lucide-react";

interface AvatarCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedBase64: string) => void;
}

export function AvatarCropModal({ imageSrc, onClose, onSave }: AvatarCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const containerSize = 256; // Viewport crop size in px

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => setImgElement(img);
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.8), 3));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCropAndSave = () => {
    if (!imgElement) return;

    const canvas = document.createElement("canvas");
    canvas.width = containerSize;
    canvas.height = containerSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, containerSize, containerSize);

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(containerSize / 2, containerSize / 2, containerSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Fill white background for transparency fallback
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, containerSize, containerSize);

    // Compute dimensions
    const baseScale = Math.max(containerSize / imgElement.width, containerSize / imgElement.height);
    const finalScale = baseScale * zoom;

    const drawWidth = imgElement.width * finalScale;
    const drawHeight = imgElement.height * finalScale;

    const drawX = containerSize / 2 + position.x - drawWidth / 2;
    const drawY = containerSize / 2 + position.y - drawHeight / 2;

    ctx.drawImage(imgElement, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    const croppedBase64 = canvas.toDataURL("image/jpeg", 0.85);
    onSave(croppedBase64);
  };

  // Base scale calculation for inline preview style
  const baseScale = imgElement
    ? Math.max(containerSize / imgElement.width, containerSize / imgElement.height)
    : 1;
  const currentScale = baseScale * zoom;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold tracking-tight">Adjust Profile Photo</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Viewport Container */}
        <div className="space-y-3">
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
            Drag to position image • Scroll or use slider to zoom
          </p>

          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={`relative w-64 h-64 mx-auto rounded-full border-4 border-blue-500/80 shadow-inner bg-slate-950 overflow-hidden select-none transition-shadow ${
              isDragging ? "cursor-grabbing ring-4 ring-blue-500/30" : "cursor-grab hover:ring-2 hover:ring-blue-500/20"
            }`}
          >
            {imgElement && (
              <img
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: `${imgElement.width * currentScale}px`,
                  height: `${imgElement.height * currentScale}px`,
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                  maxWidth: "none",
                  maxHeight: "none",
                  pointerEvents: "none",
                }}
              />
            )}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none" />
          </div>
        </div>

        {/* Controls: Zoom Slider + Reset */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 px-2">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.8))}
              className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(prev + 0.1, 3))}
              className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors ml-1"
              title="Reset Position & Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCropAndSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Save Profile Picture
          </button>
        </div>
      </div>
    </div>
  );
}
