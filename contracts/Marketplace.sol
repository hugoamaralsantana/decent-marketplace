pragma solidity ^0.8.17;

/**
 * @title Marketplace Contract
 * @dev A simple decentralized marketplace to learn Solidity
 */
contract Marketplace {
    // Blockchain state variables
    //address public owner; Removed owner field for a completely decentralized contract
    uint256 public itemCount;

    // Struct to represent item in marketplace
    // kind of like setting up a class or type
    struct Item {
        // uint vs int
        // uint can't be a negative value (id and price can't be negative)
        uint256 id;
        string name;
        string description;
        uint256 price;
        address payable seller;
        bool sold;
        bool active;
    }

    // mapping each item to a uint256 value (we're able to search any item by its id)
    mapping(uint256 => Item) public items;

    //Solidity also supports nested mappings such as:
    // mapping(address => mapping(uint256 => bool)) userPurchases;
    // This would search to see if a user (address) has purchased a specific item (uint256)

    // Event (solidity feature) allow smart contracts to communicate to outside applications
    // Logs information for applications to listen to (subscriber structure)
    // great for storing data that doesn't need to be accessed since it costs less gas
    event ItemListed(uint256 indexed id, string name, uint256 price, address seller);
    event ItemSold(uint256 indexed id, address buyer, address seller);
    event ItemUpdated(uint256 indexed id, string name, uint256 price);
    event ItemRemoved(uint256 indexed id);

    modifier onlySeller(uint256 _id) {
        require(items[_id].seller == msg.sender, "Only the seller can call this function");
        _;
    }

    modifier activeItem(uint256 _id) {
        require(items[_id].active, "Item is not active");
        _;
    }
    
    modifier itemExists(uint256 _id) {
        require(_id > 0 && _id <= itemCount, "Item does not exist");
        _;
    }
    
    modifier notSold(uint256 _id) {
        require(!items[_id].sold, "Item is already sold");
        _;
    }

    // Constructor to set contract owner
    constructor() {
        itemCount = 0;
    }

    // What is "msg"?
    // msg is basically the context around an interaction with a contract

    // msg structure:
    // msg.sender: address calling current function (user wallet address)
    // msg.value: amount of Ether sent alongside transaction
    // msg.data: complete data payload of the function call
    // msg.sig: first four bytes of msg.data that identify which function is being called

    function listItem(string memory _name, string memory _description, uint256 _price) external returns(uint256) {
        // Check for valid price
        require(_price > 0, "Price must be greater than 0");

        // Check for valid name
        require(bytes(_name).length > 0, "Name cannot be empty");

        // Increment contract item count
        itemCount++;

        // Create and store the new item on the contract
        items[itemCount] = Item(
            itemCount,
            _name,
            _description,
            _price,
            payable(msg.sender), // Sets who gets paid when this item is purchased
            false,
            true
        );

        // Emit an event for the new listing
        emit ItemListed(itemCount, _name, _price, msg.sender);

        return itemCount;
    }

    function purchaseItem(uint256 _id) external payable itemExists(_id) activeItem(_id) notSold(_id) {
        // Get item from storage
        Item storage item = items[_id];

        // Check that buyer is not seller
        require(msg.sender != item.seller, "Seller cannot buy their own item");

        // Check enough Ether was sent
        require(msg.value >= item.price, "Insufficient Ether was sent to complete the purchase");

        item.sold = true;

        // Transfer funds to the seller
        // (bool sent, ) works similarly to an await. sent = response and we check after the call was made if sent is true or false
        // if true, we know the call was made successfully and the Ether was transferred
        // if false, we return the error response and we know the transfer failed
        (bool sent, ) = item.seller.call{value: msg.value}("");
        require(sent, "Failed to send Ether to the seller");

        // Emit event of purchase
        emit ItemSold(_id, msg.sender, item.seller);
    }

    /**
     * @dev Get details of a specific item
     * @param _id ID of the item
     * @return id The unique identifier of the item
     * @return name The name of the item
     * @return description The description of the item
     * @return price The price of the item in wei
     * @return seller The address of the seller
     * @return sold Whether the item has been sold
     * @return active Whether the item is active (not removed)
     */
    function getItem(uint256 _id) external view itemExists(_id) returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 price,
        address seller,
        bool sold,
        bool active
    ) {
        Item storage item = items[_id];
        return (
            item.id,
            item.name,
            item.description,
            item.price,
            item.seller,
            item.sold,
            item.active
        );
    }

    function updateItem(
        uint256 _id, 
        string memory _name, 
        string memory _description, 
        uint256 _price
    ) 
        external 
        itemExists(_id) 
        activeItem(_id) 
        notSold(_id) 
        onlySeller(_id) 
    {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_price > 0, "Price must be greater than zero");
        
        Item storage item = items[_id];
        
        item.name = _name;
        item.description = _description;
        item.price = _price;
        
        emit ItemUpdated(_id, _name, _price);
    }

    function removeItem(uint256 _id) 
        external 
        itemExists(_id) 
        activeItem(_id)
        notSold(_id)
        onlySeller(_id)  // Only the seller can remove the item
    {
        items[_id].active = false;
        emit ItemRemoved(_id);
    }

    function getItemCount() external view returns (uint256) {
        return itemCount;
    }

    function getItems(uint256 _offset, uint256 _limit) external view returns (Item[] memory) {
        // Calculate the number of items to return
        uint256 itemsToReturn = _limit;
        
        if (_offset >= itemCount) {
            return new Item[](0);
        }
        
        if (_offset + _limit > itemCount) {
            itemsToReturn = itemCount - _offset;
        }
        
        Item[] memory result = new Item[](itemsToReturn);
        
        for (uint256 i = 0; i < itemsToReturn; i++) {
            // We add 1 because our items are 1-indexed
            uint256 itemId = _offset + i + 1;
            result[i] = items[itemId];
        }
        
        return result;
    }

    function getActiveItems() external view returns (Item[] memory) {
        // Count active items
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].active && !items[i].sold) {
                activeCount++;
            }
        }
        
        // Create array of active items
        Item[] memory activeItems = new Item[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].active && !items[i].sold) {
                activeItems[currentIndex] = items[i];
                currentIndex++;
            }
        }
        
        return activeItems;
    }

    function getSellerItems(address _seller) external view returns (Item[] memory) {
        // Count seller items
        uint256 sellerItemCount = 0;
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].seller == _seller) {
                sellerItemCount++;
            }
        }
        
        // Create array of seller items
        Item[] memory sellerItems = new Item[](sellerItemCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= itemCount; i++) {
            if (items[i].seller == _seller) {
                sellerItems[currentIndex] = items[i];
                currentIndex++;
            }
        }
        
        return sellerItems;
    }
}