// Simplified chart helper without Chart.js dependency for now
export function createChart(canvas: HTMLCanvasElement, type: 'line' | 'bar', data: any) {
  // Simple canvas drawing as placeholder
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw simple placeholder chart
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#1890ff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Chart Placeholder', canvas.width / 2, canvas.height / 2);
  ctx.fillText('Chart.js integration coming soon', canvas.width / 2, canvas.height / 2 + 25);
  
  return {
    destroy: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
}