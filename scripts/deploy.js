// deploy.js
const hre = require('hardhat');

async function main() {
  try {
    console.log('Starting deployment process...');

    // Get the contract factory
    const Marketplace = await hre.ethers.getContractFactory('Marketplace');

    // Get the deployer's address
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying Marketplace from address: ${deployer.address}`);

    // Deploy the contract
    console.log('Deploying Marketplace contract...');
    const marketplace = await Marketplace.deploy();

    // Wait for deployment to finish
    await marketplace.waitForDeployment();

    // Get the contract address
    const marketplaceAddress = await marketplace.getAddress();
    console.log(`Marketplace contract deployed to: ${marketplaceAddress}`);

    // Log the deployment transaction hash
    console.log(
      `Deployment transaction hash: ${marketplace.deploymentTransaction().hash}`
    );

    console.log('\nDeployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment script error:', error);
    process.exit(1);
  });
