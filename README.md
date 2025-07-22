# EduChain - Blockchain-based Education Management System

A decentralized application for managing education-related processes using Ethereum blockchain.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **MetaMask Wallet**
   - Install the [MetaMask browser extension](https://metamask.io/download/)
   - Create a new wallet or import an existing one

3. **Ganache GUI**
   - Download from [Ganache website](https://trufflesuite.com/ganache/)
   - Install the desktop application

## Setup Instructions

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Ganache
1. Launch Ganache GUI
2. Click "New Workspace"
3. Configure the following settings:
   - Port: 7545
   - Network ID: 5777
   - Automine: Enabled
4. Click "Save Workspace"

### Step 4: Configure MetaMask
1. Open MetaMask
2. Click on the network dropdown and select "Add Network"
3. Add the following network details:
   - Network Name: Ganache
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 5777
   - Currency Symbol: ETH
4. Import an account from Ganache:
   - In Ganache, click on the key icon next to any account
   - Copy the private key
   - In MetaMask, click "Import Account"
   - Paste the private key

### Step 5: Configure Environment Variables
1. Create a `.env.local` file in the project root
2. Deploy your smart contracts to Ganache:
   ```bash
   # Navigate to your smart contracts directory
   cd blockchain
   
   # Install dependencies if not already installed
   npm install
   
   # Deploy contracts
   npx hardhat run scripts/deploy.js --network ganache
   ```
3. After deployment, Ganache will show the contract addresses. Update `.env.local` with the actual addresses:
```env
VITE_FEE_PAYMENT_ADDRESS=<actual-contract-address>
VITE_SCHOLARSHIP_ADDRESS=<actual-contract-address>
VITE_PAYROLL_ADDRESS=<actual-contract-address>
VITE_FUND_ALLOCATION_ADDRESS=<actual-contract-address>
VITE_EDUCATION_CERTIFICATE_ADDRESS=<actual-contract-address>
```

### Step 6: Run the Development Server
```bash
npm run dev
```

### Step 7: Access the Application
1. Open your browser and navigate to `http://localhost:5173`
2. Connect your MetaMask wallet
3. Ensure you're connected to the Ganache network

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context providers
├── contracts/      # Smart contract ABIs
├── pages/          # Page components
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Troubleshooting

### Ganache Connection Issues
- Ensure Ganache is running
- Verify the RPC URL in MetaMask matches Ganache's port
- Check if the network ID matches (5777)

### MetaMask Issues
- Make sure MetaMask is unlocked
- Verify you're connected to the Ganache network
- Check if you have sufficient test ETH (Ganache provides 100 ETH per account)

### Contract Interaction Issues
- Verify contract addresses in `.env.local`
- Check if you're using the correct network
- Ensure you have the required permissions

## Important Notes

1. **Keep Ganache Running**
   - The application requires Ganache to be running
   - Don't close Ganache while using the application

2. **Test Environment**
   - This is a development environment
   - Use test accounts and test ETH only
   - Don't use real ETH or mainnet accounts

3. **Security**
   - Never share your private keys
   - Keep your MetaMask seed phrase secure
   - Use different accounts for development and production

## Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify Ganache and MetaMask configurations
3. Ensure all prerequisites are properly installed
4. Check the contract addresses in `.env.local`

For additional support, please open an issue in the repository. 