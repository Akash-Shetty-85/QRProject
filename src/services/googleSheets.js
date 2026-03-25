export const submitToGoogleSheet = async (data, webAppUrl) => {
  if (!webAppUrl) {
    console.warn("No Web App URL provided for Google Sheets. Mocking successful submission.");
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, mocked: true }), 1000));
  }
  
  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors', // Crucial to prevent CORS preflight error with Google Apps Script
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    
    // Some Apps Script configurations return opaque responses with ok=false when using standard fetch without CORS setup,
    // but the POST usually still succeeds.
    return { success: true };
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error);
    throw error;
  }
}
