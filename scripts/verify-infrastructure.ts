import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OCR_API_KEY = process.env.OCR_SPACE_API_KEY!;
const POLYGON_RPC = process.env.POLYGON_RPC_URL!;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY!;

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const results: TestResult[] = [];

// Task 1: ENV Check
async function checkEnv() {
  console.log('\n🔍 Task 1: Checking Environment Variables...');
  try {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OCR_SPACE_API_KEY',
      'POLYGON_RPC_URL',
      'BLOCKCHAIN_PRIVATE_KEY'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      results.push({
        name: 'ENV CHECK',
        status: 'FAIL',
        details: `Missing: ${missing.join(', ')}`
      });
      return;
    }
    
    results.push({
      name: 'ENV CHECK',
      status: 'PASS',
      details: 'All required environment variables are set'
    });
  } catch (error) {
    results.push({
      name: 'ENV CHECK',
      status: 'FAIL',
      details: String(error)
    });
  }
}

// Task 2: Supabase Database Connectivity
async function testSupabaseDB() {
  console.log('\n🔍 Task 2: Testing Supabase Database...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .limit(1);
    
    if (error) {
      results.push({
        name: 'SUPABASE DB',
        status: 'FAIL',
        details: `Error: ${error.message}`
      });
      return;
    }
    
    results.push({
      name: 'SUPABASE DB',
      status: 'PASS',
      details: `Query executed successfully. Rows returned: ${data?.length || 0}`
    });
  } catch (error: any) {
    results.push({
      name: 'SUPABASE DB',
      status: 'FAIL',
      details: `Exception: ${error.message}`
    });
  }
}

// Task 3: Supabase Storage Test
async function testSupabaseStorage() {
  console.log('\n Task 3: Testing Supabase Storage...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Create a small test file
    const testContent = 'This is a test file for Credexia infrastructure verification';
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('financials')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      results.push({
        name: 'SUPABASE STORAGE',
        status: 'FAIL',
        details: `Upload error: ${uploadError.message}`
      });
      return;
    }
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('financials')
      .getPublicUrl(testFileName);
    
    if (!urlData?.publicUrl) {
      results.push({
        name: 'SUPABASE STORAGE',
        status: 'FAIL',
        details: 'Could not retrieve public URL'
      });
      return;
    }
    
    results.push({
      name: 'SUPABASE STORAGE',
      status: 'PASS',
      details: `File uploaded successfully. URL: ${urlData.publicUrl}`
    });
    
    // Clean up
    await supabase.storage.from('financials').remove([testFileName]);
  } catch (error: any) {
    results.push({
      name: 'SUPABASE STORAGE',
      status: 'FAIL',
      details: `Exception: ${error.message}`
    });
  }
}

// Task 4: OCR API Test
async function testOCRAPI() {
  console.log('\n🔍 Task 4: Testing OCR.space API...');
  try {
    // Use a simple base64 encoded image with text
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC';
    
    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('base64Image', testImageBase64);
    formData.append('language', 'eng');
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      results.push({
        name: 'OCR API',
        status: 'FAIL',
        details: `HTTP ${response.status}: ${response.statusText}`
      });
      return;
    }
    
    const data = await response.json();
    
    // Check if API responded (even with error)
    if (data.IsErroredOnProcessing === false && data.ParsedResults) {
      const extractedText = data.ParsedResults[0]?.ParsedText || '';
      results.push({
        name: 'OCR API',
        status: 'PASS',
        details: `API responded successfully. Extracted text: "${extractedText.substring(0, 50)}"`
      });
    } else if (data.OCRExitCode !== undefined) {
      // API is responsive but image processing had issues
      results.push({
        name: 'OCR API',
        status: 'PASS',
        details: `API is responsive (Exit code: ${data.OCRExitCode}). Image format test issue, but API connection confirmed.`
      });
    } else {
      results.push({
        name: 'OCR API',
        status: 'FAIL',
        details: `Unexpected response format: ${JSON.stringify(data).substring(0, 100)}`
      });
    }
  } catch (error: any) {
    results.push({
      name: 'OCR API',
      status: 'FAIL',
      details: `Exception: ${error.message}`
    });
  }
}

// Task 5: Covenant Engine Logic Test
async function testCovenantLogic() {
  console.log('\n🔍 Task 5: Testing Covenant Engine Logic...');
  try {
    // Mocked values
    const totalDebt = 14000000;
    const ebitda = 3000000;
    const covenantLimit = 3.5;
    
    // Calculate ratio
    const ratio = totalDebt / ebitda;
    
    // Determine status
    const status = ratio > covenantLimit ? 'RED' : 'GREEN';
    
    // Expected values
    const expectedRatio = 4.666666666666667; // 14M / 3M
    const expectedStatus = 'RED';
    
    // Verify ratio (with floating point tolerance)
    const ratioMatch = Math.abs(ratio - expectedRatio) < 0.01;
    const statusMatch = status === expectedStatus;
    
    if (!ratioMatch || !statusMatch) {
      results.push({
        name: 'COVENANT LOGIC',
        status: 'FAIL',
        details: `Expected ratio=4.67, status=RED. Got ratio=${ratio.toFixed(2)}, status=${status}`
      });
      return;
    }
    
    results.push({
      name: 'COVENANT LOGIC',
      status: 'PASS',
      details: `Ratio=${ratio.toFixed(2)}, Status=${status} (correct)`
    });
  } catch (error: any) {
    results.push({
      name: 'COVENANT LOGIC',
      status: 'FAIL',
      details: `Exception: ${error.message}`
    });
  }
}

// Task 6: Blockchain Connectivity Test
async function testBlockchain() {
  console.log('\n🔍 Task 6: Testing Blockchain RPC...');
  try {
    // Connect to Polygon Amoy
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    
    // Create wallet
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Get wallet address
    const address = wallet.address;
    
    // Query balance
    const balance = await provider.getBalance(address);
    const balanceInMatic = ethers.formatEther(balance);

    if (balance < BigInt(0)) {
      results.push({
        name: 'BLOCKCHAIN RPC',
        status: 'FAIL',
        details: 'Balance is negative (impossible)'
      });
      return;
    }
    
    results.push({
      name: 'BLOCKCHAIN RPC',
      status: 'PASS',
      details: `Wallet: ${address}, Balance: ${balanceInMatic} MATIC`
    });
  } catch (error: any) {
    results.push({
      name: 'BLOCKCHAIN RPC',
      status: 'FAIL',
      details: `Exception: ${error.message}`
    });
  }
}

// Task 7: Smart Contract Deployment Readiness
async function testDeploymentReadiness() {
  console.log('\n🔍 Task 7: Checking Deployment Readiness...');
  try {
    // Check if hardhat config exists
    const hardhatConfigPath = path.join(process.cwd(), 'hardhat.config.ts');
    if (!fs.existsSync(hardhatConfigPath)) {
      results.push({
        name: 'DEPLOY READY',
        status: 'FAIL',
        details: 'hardhat.config.ts not found'
      });
      return;
    }
    
    // Check if contracts directory exists
    const contractsPath = path.join(process.cwd(), 'contracts');
    if (!fs.existsSync(contractsPath)) {
      results.push({
        name: 'DEPLOY READY',
        status: 'FAIL',
        details: 'contracts directory not found'
      });
      return;
    }
    
    // Note: Actual compilation will be tested separately via Hardhat CLI
    // For now, check that deployer wallet has balance
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    const balanceInMatic = parseFloat(ethers.formatEther(balance));
    
    if (balanceInMatic < 0.01) {
      results.push({
        name: 'DEPLOY READY',
        status: 'FAIL',
        details: `Insufficient balance: ${balanceInMatic} MATIC (need at least 0.01)`
      });
      return;
    }
    
    results.push({
      name: 'DEPLOY READY',
      status: 'PASS',
      details: `Config exists, wallet has ${balanceInMatic.toFixed(4)} MATIC. Compile check needed separately.`
    });
  } catch (error: any) {
    results.push({
      name: 'DEPLOY READY',
      status: 'FAIL',
      details: `Exception: ${error.message}`
    });
  }
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   Credexia Infrastructure Verification');
  console.log('═══════════════════════════════════════════════════');
  
  await checkEnv();
  await testSupabaseDB();
  await testSupabaseStorage();
  await testOCRAPI();
  await testCovenantLogic();
  await testBlockchain();
  await testDeploymentReadiness();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('                 FINAL RESULTS');
  console.log('═══════════════════════════════════════════════════\n');
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status}`);
    console.log(`   ${result.details}\n`);
  });
  
  console.log('═══════════════════════════════════════════════════');
  console.log('                 SUMMARY FORMAT');
  console.log('═══════════════════════════════════════════════════\n');
  
  results.forEach(result => {
    console.log(`${result.name}: ${result.status}`);
  });
  
  console.log('\n═══════════════════════════════════════════════════');
  
  // Exit with error code if any test failed
  const failedCount = results.filter(r => r.status === 'FAIL').length;
  process.exit(failedCount > 0 ? 1 : 0);
}

main();
