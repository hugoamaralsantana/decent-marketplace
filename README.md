# Decentralized Marketplace

A peer-to-peer marketplace built on Ethereum that allows users to list, purchase, and manage items without any central authority.

## Project Overview

This project is a decentralized application (DApp) that implements a digital marketplace on the Ethereum blockchain. Users can list items for sale, purchase items with ETH, and manage their listings, all without intermediaries.

## What I Learned

Building this marketplace taught me the fundamentals of Solidity and blockchain development:

- **Smart Contract Structure**: How to organize contract code for readability and efficiency
- **Data Management**: Using mappings and structs to store and retrieve complex data
- **Access Control**: Implementing modifiers to restrict function access
- **Blockchain Events**: Emitting events to provide transaction logs and enable frontend updates
- **ETH Transfers**: Securely handling cryptocurrency transactions
- **Gas Optimization**: Writing code with gas costs in mind

I learned how blockchain fundamentally changes application architecture by removing the need for centralized databases and trusted third parties.

## Design Decisions

### Fully Decentralized Approach

I deliberately chose to create a marketplace without an admin role or centralized control mechanism. This decision means:

- Only sellers can update or remove their own listings
- No external entity can modify or censor listings
- The contract operates autonomously once deployed

This approach aligns with blockchain's core philosophy of disintermediation and censorship-resistance. While it means there's no mechanism to remove fraudulent listings except by the original seller, it creates a truly trustless protocol where rules are enforced by code alone.

## Features

- List items with name, description, and price
- Purchase items by sending ETH
- Update listing details (seller only)
- Remove listings (seller only)
- Browse all active marketplace items
- View seller-specific items
- All transactions recorded as blockchain events

## Technical Details

### Main Functions

```solidity
// Core functionality
listItem(string name, string description, uint256 price)
purchaseItem(uint256 id)
updateItem(uint256 id, string name, string description, uint256 price)
removeItem(uint256 id)

// Query functions
getItem(uint256 id)
getActiveItems()
getSellerItems(address seller)
getItems(uint256 offset, uint256 limit)
```

### Implementation Notes

The contract uses:

- A struct to define Item properties
- A mapping to store and retrieve items by ID
- Modifiers for access control
- Events to log all marketplace actions
- Boolean flags to track item status without deletion

## Setup and Usage

### Prerequisites

- Node.js and npm
- Hardhat
- MetaMask or similar wallet

### Installation

```bash
git clone https://github.com/yourusername/defi-marketplace.git
cd defi-marketplace
npm install
```

### Testing

```bash
npx hardhat test
```

### Deployment

```bash
# Local development
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Interaction

Update the contract address in `interact.js`, then:

```bash
npx hardhat run scripts/interact.js --network localhost
```

## Future Enhancements

Potential improvements:

- Category system for item organization
- IPFS integration for item images
- Reputation system for buyers and sellers
- Escrow functionality for dispute resolution
- Auction capability for dynamic pricing

## License

This project is licensed under the MIT License.
