import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    // Read deployment config
    const deploymentPath = path.join(__dirname, '../deployment-config.json');
    const config = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    console.log("Verifying contract deployment...");
    console.log("Contract Address:", config.contractAddress);
    console.log("Admin Address:", config.adminAddress);

    // Get provider
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
    
    // Get contract code
    const contractCode = await provider.getCode(config.contractAddress);
    if (contractCode === "0x") {
      console.error("\n❌ Contract is NOT deployed at the specified address!");
      return;
    }
    console.log("\n✅ Contract code found at address!");

    // Try to get admin address from contract
    try {
      const contract = new ethers.Contract(
        config.contractAddress,
        ["function admin() view returns (address)"],
        provider
      );
      const admin = await contract.admin();
      console.log("Contract admin address:", admin);
      
      if (admin.toLowerCase() === config.adminAddress.toLowerCase()) {
        console.log("✅ Admin address matches deployment config!");
      } else {
        console.log("❌ Admin address does NOT match deployment config!");
      }
    } catch (error) {
      console.error("Error calling admin() function:", error.message);
    }

  } catch (error) {
    console.error("\nVerification failed!");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 