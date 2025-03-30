const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Marketplace', function () {
  let marketplace;
  let seller;
  let buyer;
  let user;

  beforeEach(async function () {
    // Get contract factory and deploy
    const Marketplace = await ethers.getContractFactory('Marketplace');
    marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();

    // Get signers
    [seller, buyer, user] = await ethers.getSigners();
  });

  describe('Basic functionality', function () {
    it('Should start with zero items', async function () {
      expect(await marketplace.itemCount()).to.equal(0);
    });

    it('Should allow users to list items', async function () {
      // List an item
      await marketplace
        .connect(seller)
        .listItem('Test Item', 'This is a test item', ethers.parseEther('0.1'));

      // Check item count
      expect(await marketplace.itemCount()).to.equal(1);

      // Get item details
      const item = await marketplace.getItem(1);

      expect(item[0]).to.equal(1); // id
      expect(item[1]).to.equal('Test Item'); // name
      expect(item[2]).to.equal('This is a test item'); // description
      expect(item[3]).to.equal(ethers.parseEther('0.1')); // price
      expect(item[4]).to.equal(seller.address); // seller
      expect(item[5]).to.equal(false); // sold
      expect(item[6]).to.equal(true); // active
    });

    it('Should allow users to purchase items', async function () {
      // List an item
      await marketplace
        .connect(seller)
        .listItem(
          'For Sale Item',
          'Item available for purchase',
          ethers.parseEther('0.2')
        );

      // Purchase the item
      await marketplace
        .connect(buyer)
        .purchaseItem(1, { value: ethers.parseEther('0.2') });

      // Check item is marked as sold
      const item = await marketplace.getItem(1);
      expect(item[5]).to.equal(true); // sold
    });

    it('Should allow sellers to update their items', async function () {
      // List an item
      await marketplace
        .connect(seller)
        .listItem(
          'Original Item',
          'Original description',
          ethers.parseEther('0.1')
        );

      // Update the item
      await marketplace
        .connect(seller)
        .updateItem(
          1,
          'Updated Item',
          'Updated description',
          ethers.parseEther('0.15')
        );

      // Check item was updated
      const item = await marketplace.getItem(1);
      expect(item[1]).to.equal('Updated Item');
      expect(item[2]).to.equal('Updated description');
      expect(item[3]).to.equal(ethers.parseEther('0.15'));
    });

    it('Should allow sellers to remove their items', async function () {
      // List an item
      await marketplace
        .connect(seller)
        .listItem(
          'Removable Item',
          'Item to be removed',
          ethers.parseEther('0.3')
        );

      // Remove the item
      await marketplace.connect(seller).removeItem(1);

      // Check item is inactive
      const item = await marketplace.getItem(1);
      expect(item[6]).to.equal(false); // active = false
    });

    it('Should prevent non-sellers from removing items', async function () {
      // List an item
      await marketplace
        .connect(seller)
        .listItem(
          'Restricted Item',
          'Only seller can remove',
          ethers.parseEther('0.3')
        );

      // Try to remove as non-seller
      await expect(marketplace.connect(user).removeItem(1)).to.be.revertedWith(
        'Only the seller can call this function'
      );
    });
  });

  describe('View functions', function () {
    beforeEach(async function () {
      // List multiple items for testing
      await marketplace
        .connect(seller)
        .listItem('Item 1', 'Description 1', ethers.parseEther('0.1'));
      await marketplace
        .connect(seller)
        .listItem('Item 2', 'Description 2', ethers.parseEther('0.2'));
      await marketplace
        .connect(buyer)
        .listItem('Item 3', 'Description 3', ethers.parseEther('0.3'));

      // Remove one item
      await marketplace.connect(seller).removeItem(2);

      // Purchase one item
      await marketplace
        .connect(buyer)
        .purchaseItem(1, { value: ethers.parseEther('0.1') });
    });

    it('Should return only active items', async function () {
      const activeItems = await marketplace.getActiveItems();
      expect(activeItems.length).to.equal(1);
      expect(activeItems[0].id).to.equal(3); // Only Item 3 should be active and unsold
    });

    it('Should return seller-specific items', async function () {
      const sellerItems = await marketplace.getSellerItems(seller.address);
      expect(sellerItems.length).to.equal(2); // Items 1 and 2
    });
  });
});
