const hre = require("hardhat");

async function main() {
  // Deploy StudentRegistry
  const StudentRegistry = await hre.ethers.getContractFactory("StudentRegistry");
  const studentRegistry = await StudentRegistry.deploy();
  await studentRegistry.waitForDeployment();
  console.log("StudentRegistry deployed to:", await studentRegistry.getAddress());

  // Deploy EmployeeRegistry
  const EmployeeRegistry = await hre.ethers.getContractFactory("EmployeeRegistry");
  const employeeRegistry = await EmployeeRegistry.deploy();
  await employeeRegistry.waitForDeployment();
  console.log("EmployeeRegistry deployed to:", await employeeRegistry.getAddress());

  // Update deployment config
  const fs = require('fs');
  const config = {
    studentRegistryAddress: await studentRegistry.getAddress(),
    employeeRegistryAddress: await employeeRegistry.getAddress(),
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync('deployment-config.json', JSON.stringify(config, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 