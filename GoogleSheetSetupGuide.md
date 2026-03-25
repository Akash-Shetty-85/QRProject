# Google Sheets Backend Setup 🚀

To connect your React frontend to your Google Sheet without a complex server, follow these steps:

1. **Create a new Google Sheet** and add the following headers in Row 1:
   `From`, `Delivered By`, `To`, `Received By`, `Product Description`, `Product Code`, `Batch Number`, `Moment Type`, `Scanned By`, `Final Received By`, `Time Stamp`

2. In the Google Sheet, go to **Extensions > Apps Script**.
3. Replace any existing code with the following snippet:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const payload = JSON.parse(e.postData.contents);
    
    // Support processing one or an array of items (Batch Submit)
    const items = Array.isArray(payload) ? payload : [payload];
    
    // Prepare all rows to insert
    items.forEach(data => {
      sheet.appendRow([
        data.from || "",
        data.deliveredBy || "",
        data.to || "",
        data.receivedBy || "",
        data.productDescription || "",
        data.productCode || "",
        data.batchNumber || "",
        data.momentType || "",
        data.scannedBy || "",
        data.finalReceivedBy || "",
        data.timeStamp || ""
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, count: items.length }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Deploy > New deployment** in the top right.
5. Select type: **Web app**.
6. **Description**: Initial deploy
7. **Execute as**: Me
8. **Who has access**: **Anyone** (Important!)
9. Click **Deploy**. You will need to click "Review Permissions", select your account, click "Advanced", and "Go to project (unsafe)".
10. Copy the **Web app URL**.
11. In your local codebase, open `src/components/DataForm.jsx` (around line 77) and paste the URL:
    `const WEB_APP_URL = "https://script.google.com/macros/s/YOUR_ID/exec";`
