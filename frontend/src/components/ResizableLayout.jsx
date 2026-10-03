import React, { useState, useEffect, useRef } from 'react';

export default function ResizableLayout({
  leftContent,
  rightContent,
  bottomContent,
  initialLeftWidth = 38, // percentage
  initialBottomHeight = 350, // pixels
  leftCollapsed = false,
  rightCollapsed = false,
  bottomCollapsed = false,
  onToggleLeft,
  onToggleRight,
  onToggleBottom
}) {
  const [leftWidthPct, setLeftWidthPct] = useState(initialLeftWidth);
  const [bottomHeightPx, setBottomHeightPx] = useState(initialBottomHeight);
  const isDraggingHoriz = useRef(false);
  const isDraggingVert = useRef(false);

  // Restore sizes from localStorage if available
  useEffect(() => {
    const savedLeft = localStorage.getItem('logicopt_ide_left_width');
    const savedBottom = localStorage.getItem('logicopt_ide_bottom_height');
    if (savedLeft) setLeftWidthPct(parseFloat(savedLeft));
    if (savedBottom) setBottomHeightPx(parseFloat(savedBottom));
  }, []);

  const handleMouseDownHoriz = (e) => {
    e.preventDefault();
    isDraggingHoriz.current = true;
    document.addEventListener('mousemove', handleMouseMoveHoriz);
    document.addEventListener('mouseup', handleMouseUpHoriz);
  };

  const handleMouseMoveHoriz = (e) => {
    if (!isDraggingHoriz.current) return;
    const windowWidth = window.innerWidth;
    const newPct = (e.clientX / windowWidth) * 100;
    const clampedPct = Math.max(15, Math.min(70, newPct)); // limit left panel between 15% and 70%
    setLeftWidthPct(clampedPct);
    localStorage.setItem('logicopt_ide_left_width', clampedPct.toString());
  };

  const handleMouseUpHoriz = () => {
    isDraggingHoriz.current = false;
    document.removeEventListener('mousemove', handleMouseMoveHoriz);
    document.removeEventListener('mouseup', handleMouseUpHoriz);
    window.dispatchEvent(new Event('resize')); // notify canvas to adapt
  };

  const handleMouseDownVert = (e) => {
    e.preventDefault();
    isDraggingVert.current = true;
    document.addEventListener('mousemove', handleMouseMoveVert);
    document.addEventListener('mouseup', handleMouseUpVert);
  };

  const handleMouseMoveVert = (e) => {
    if (!isDraggingVert.current) return;
    const windowHeight = window.innerHeight;
    const newHeight = windowHeight - e.clientY;
    const clampedHeight = Math.max(100, Math.min(windowHeight * 0.7, newHeight)); // limit bottom panel
    setBottomHeightPx(clampedHeight);
    localStorage.setItem('logicopt_ide_bottom_height', clampedHeight.toString());
  };

  const handleMouseUpVert = () => {
    isDraggingVert.current = false;
    document.removeEventListener('mousemove', handleMouseMoveVert);
    document.removeEventListener('mouseup', handleMouseUpVert);
    window.dispatchEvent(new Event('resize')); // notify canvas to adapt
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
      {/* Top Section: Split Left & Right Panels */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Panel */}
        {!leftCollapsed && (
          <div style={{
            width: rightCollapsed ? '100%' : `${leftWidthPct}%`,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-color)',
            height: '100%',
            overflow: 'hidden',
            transition: isDraggingHoriz.current ? 'none' : 'width 0.1s ease'
          }}>
            {leftContent}
          </div>
        )}

        {/* Horizontal Split Resizer Handle */}
        {!leftCollapsed && !rightCollapsed && (
          <div
            onMouseDown={handleMouseDownHoriz}
            style={{
              width: '6px',
              background: 'var(--bg-darker)',
              cursor: 'col-resize',
              zIndex: 20,
              borderLeft: '1px solid var(--border-color)',
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none'
            }}
            title="Drag to resize panels"
          >
            <div style={{ width: '2px', height: '24px', background: 'var(--border-color)', borderRadius: '1px' }} />
          </div>
        )}

        {/* Right Panel (Main Canvas) */}
        {!rightCollapsed && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            background: 'var(--bg-darker)'
          }}>
            {rightContent}
          </div>
        )}
      </div>

      {/* Vertical Split Resizer Handle */}
      {!bottomCollapsed && (
        <div
          onMouseDown={handleMouseDownVert}
          style={{
            height: '6px',
            background: 'var(--bg-darker)',
            cursor: 'row-resize',
            zIndex: 20,
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none'
          }}
          title="Drag to resize bottom panel"
        >
          <div style={{ width: '32px', height: '2px', background: 'var(--border-color)', borderRadius: '1px' }} />
        </div>
      )}

      {/* Bottom Panel */}
      {!bottomCollapsed && (
        <div style={{
          height: `${bottomHeightPx}px`,
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          overflow: 'hidden'
        }}>
          {bottomContent}
        </div>
      )}
    </div>
  );
}
