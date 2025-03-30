// interact.js
const hre = require('hardhat');

// You'll need to update this with your deployed contract address
const MARKETPLACE_ADDRESS =
  process.env.MARKETPLACE_ADDRESS ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

async function main() {
  try {
    console.log(
      `Starting interaction with Marketplace at ${MARKETPLACE_ADDRESS}`
    );

    // Get the contract instance
    const marketplace = await hre.ethers.getContractAt(
      'Marketplace',
      MARKETPLACE_ADDRESS
    );

    // Get the signers (accounts)
    const [user1, user2] = await hre.ethers.getSigners();

    console.log('Available accounts:');
    console.log(`- User1: ${user1.address}`);
    console.log(`- User2: ${user2.address}`);

    // List an item as User1
    console.log('\n1. Listing an item from User1...');
    const listTx = await marketplace.connect(user1).listItem(
      'Vintage Guitar',
      'A beautiful vintage electric guitar in excellent condition',
      hre.ethers.parseEther('0.5') // 0.5 ETH
    );

    await listTx.wait();
    const itemId = await marketplace.itemCount();
    console.log(`Item listed successfully with ID: ${itemId}`);

    // Get the item details
    console.log(`\n2. Getting details for item ${itemId}...`);
    const item = await marketplace.getItem(itemId);
    console.log('Item details:');
    console.log(`- Name: ${item[1]}`);
    console.log(`- Description: ${item[2]}`);
    console.log(`- Price: ${hre.ethers.formatEther(item[3])} ETH`);
    console.log(`- Seller: ${item[4]}`);

    // Update the item
    console.log('\n3. Updating the item...');
    const updateTx = await marketplace.connect(user1).updateItem(
      itemId,
      'Vintage Fender Stratocaster',
      'A rare 1975 Fender Stratocaster in mint condition',
      hre.ethers.parseEther('0.7') // Increased price
    );

    await updateTx.wait();
    console.log('Item updated successfully!');

    // List another item from User2
    console.log('\n4. Listing an item from User2...');
    const listTx2 = await marketplace
      .connect(user2)
      .listItem(
        'Acoustic Guitar',
        'Handcrafted acoustic guitar with premium tonewoods',
        hre.ethers.parseEther('0.4')
      );

    await listTx2.wait();
    const itemId2 = await marketplace.itemCount();
    console.log(`Second item listed with ID: ${itemId2}`);

    // Purchase item as User2
    console.log(`\n5. User2 purchasing item ${itemId}...`);
    const purchaseTx = await marketplace
      .connect(user2)
      .purchaseItem(itemId, { value: hre.ethers.parseEther('0.7') });

    await purchaseTx.wait();
    console.log('Item purchased successfully!');

    // Try removing an item (will revert since it's sold)
    console.log('\n6. Attempting to remove a sold item (this will fail)...');
    try {
      await marketplace.connect(user1).removeItem(itemId);
    } catch (error) {
      console.log('Failed as expected: ' + error.message.split("'")[0]);
    }

    // User2 removes their own item
    console.log(`\n7. User2 removing their item (ID: ${itemId2})...`);
    const removeTx = await marketplace.connect(user2).removeItem(itemId2);
    await removeTx.wait();
    console.log('Item removed successfully!');

    // Get all active items
    console.log('\n8. Getting all active items...');
    const activeItems = await marketplace.getActiveItems();
    console.log(`Found ${activeItems.length} active items`);

    // Get seller items
    console.log(`\n9. Getting all items from User1...`);
    const user1Items = await marketplace.getSellerItems(user1.address);
    console.log(`User1 has listed ${user1Items.length} items`);

    console.log('\nInteraction script completed successfully!');
  } catch (error) {
    console.error('Error during interaction:');
    console.error(error);
  }
}

// Execute the interaction script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
