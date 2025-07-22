require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const fs = require('fs');
const path = require('path');

// Copy artifacts to src directory after compilation
task("compile")
  .setAction(async function (args, hre, runSuper) {
    await runSuper();
    
    // Ensure the target directory exists
    const srcArtifactsDir = path.join(__dirname, 'src/contracts/artifacts/contracts');
    fs.mkdirSync(srcArtifactsDir, { recursive: true });

    // Copy artifacts if they exist
    const artifactsDir = path.join(__dirname, 'artifacts/contracts');
    if (fs.existsSync(artifactsDir)) {
      fs.readdirSync(artifactsDir).forEach(contractDir => {
        const contractPath = path.join(artifactsDir, contractDir);
        if (fs.statSync(contractPath).isDirectory()) {
          const jsonFiles = fs.readdirSync(contractPath).filter(file => file.endsWith('.json'));
          jsonFiles.forEach(jsonFile => {
            fs.copyFileSync(
              path.join(contractPath, jsonFile),
              path.join(srcArtifactsDir, jsonFile)
            );
          });
        }
      });
    }
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}; 