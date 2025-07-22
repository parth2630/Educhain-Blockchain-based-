module.exports = {
  contracts_build_directory: "./src/contracts/artifacts/contracts",
  contracts_directory: "./src/contracts",
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}; 