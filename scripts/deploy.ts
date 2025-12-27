import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   CovenantGuard - Contract Deployment');
  console.log('═══════════════════════════════════════════════════\n');

  // Load environment variables
  const rpcUrl = process.env.POLYGON_RPC_URL;
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error('❌ Missing POLYGON_RPC_URL or BLOCKCHAIN_PRIVATE_KEY in .env.local');
    process.exit(1);
  }

  // Connect to network
  console.log('📡 Connecting to Polygon Amoy...');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`   Deployer: ${wallet.address}`);
  
  const balance = await provider.getBalance(wallet.address);
  const balanceInMatic = ethers.formatEther(balance);
  console.log(`   Balance: ${balanceInMatic} MATIC`);

  if (parseFloat(balanceInMatic) < 0.01) {
    console.error('❌ Insufficient balance for deployment. Need at least 0.01 MATIC');
    process.exit(1);
  }

  // Load compiled contract
  console.log('\n📦 Loading compiled contract...');
  const artifactPath = path.join(
    process.cwd(),
    'artifacts',
    'contracts',
    'CovenantRegistry.sol',
    'CovenantRegistry.json'
  );

  if (!fs.existsSync(artifactPath)) {
    console.error('❌ Contract artifact not found. Run: npx hardhat compile');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode;

  console.log('   ✅ Contract artifact loaded');

  // Deploy contract
  console.log('\n🚀 Deploying CovenantRegistry...');
  
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  
  console.log(`   Transaction hash: ${contract.deploymentTransaction()?.hash}`);
  console.log('   Waiting for confirmation...');
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log(`   ✅ Contract deployed at: ${contractAddress}`);

  // Update .env.local with contract address
  console.log('\n📝 Updating .env.local...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('COVENANT_REGISTRY_ADDRESS=')) {
    envContent = envContent.replace(
      /COVENANT_REGISTRY_ADDRESS=.*/,
      `COVENANT_REGISTRY_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\n# Smart Contract\nCOVENANT_REGISTRY_ADDRESS=${contractAddress}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('   ✅ Contract address saved to .env.local');

  // Verify deployment
  console.log('\n🔍 Verifying deployment...');
  
  const deployedCode = await provider.getCode(contractAddress);
  if (deployedCode !== '0x') {
    console.log('   ✅ Contract code verified on-chain');
  } else {
    console.error('   ❌ No code at contract address');
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('   DEPLOYMENT COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log(`\n   Contract Address: ${contractAddress}`);
  console.log(`   Explorer: https://www.oklink.com/amoy/address/${contractAddress}`);
  console.log('\n═══════════════════════════════════════════════════\n');
}

main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
