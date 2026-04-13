export const trackButtonClick = (buttonName: string, additionalData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).clarity) {
    (window as any).clarity("set", "ButtonClicked", buttonName);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Setting additional data in Clarity
          (window as any).clarity("set", key, String(value));
        }
      });
    }
  }
};
