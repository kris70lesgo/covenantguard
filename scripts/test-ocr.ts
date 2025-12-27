// Quick OCR API diagnostic test
const OCR_API_KEY = process.env.OCR_SPACE_API_KEY || 'K83548240288957';

async function testOCR() {
  try {
    const testImageURL = 'https://api.ocr.space/Content/Images/receipt-ocr-original.jpg';
    
    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('url', testImageURL);
    formData.append('language', 'eng');
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Full response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testOCR();
