const FeePayment = artifacts.require("FeePayment");
const Scholarship = artifacts.require("Scholarship");
const Payroll = artifacts.require("Payroll");
const FundAllocation = artifacts.require("FundAllocation");
const EducationCertificate = artifacts.require("EducationCertificate");

module.exports = async function(deployer) {
  // Deploy FeePayment contract
  await deployer.deploy(FeePayment);
  const feePayment = await FeePayment.deployed();
  console.log("FeePayment deployed at:", feePayment.address);

  // Deploy Scholarship contract
  await deployer.deploy(Scholarship);
  const scholarship = await Scholarship.deployed();
  console.log("Scholarship deployed at:", scholarship.address);

  // Deploy Payroll contract
  await deployer.deploy(Payroll);
  const payroll = await Payroll.deployed();
  console.log("Payroll deployed at:", payroll.address);

  // Deploy FundAllocation contract
  await deployer.deploy(FundAllocation);
  const fundAllocation = await FundAllocation.deployed();
  console.log("FundAllocation deployed at:", fundAllocation.address);

  // Deploy EducationCertificate contract
  await deployer.deploy(EducationCertificate);
  const educationCertificate = await EducationCertificate.deployed();
  console.log("EducationCertificate deployed at:", educationCertificate.address);
}; 