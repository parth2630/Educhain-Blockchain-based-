import pkg from 'hardhat';
const { ethers } = pkg;
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const EmployeeRegistry = await ethers.getContractFactory("EmployeeRegistry");
  const employeeRegistry = await EmployeeRegistry.deploy();

  await employeeRegistry.waitForDeployment();

  console.log("EmployeeRegistry deployed to:", await employeeRegistry.getAddress());
  console.log("Admin address:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: await employeeRegistry.getAddress(),
    adminAddress: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    join(__dirname, '../deployment-config.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 