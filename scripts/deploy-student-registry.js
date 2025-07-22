import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    const StudentRegistry = await ethers.getContractFactory("StudentRegistry");
    console.log("Deploying StudentRegistry...");
    const studentRegistry = await StudentRegistry.deploy();

    console.log("Waiting for deployment transaction...");
    await studentRegistry.waitForDeployment();

    const contractAddress = await studentRegistry.getAddress();
    console.log("\nDeployment successful!");
    console.log("--------------------");
    console.log("StudentRegistry deployed to:", contractAddress);
    console.log("Admin address:", deployer.address);
    
    // Save the deployment info
    const config = {
      contractAddress,
      adminAddress: deployer.address,
      timestamp: new Date().toISOString()
    };

    const deploymentPath = path.join(__dirname, '../deployment-config.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(config, null, 2));
    console.log("\nDeployment info saved to:", deploymentPath);
  } catch (error) {
    console.error("\nDeployment failed!");
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