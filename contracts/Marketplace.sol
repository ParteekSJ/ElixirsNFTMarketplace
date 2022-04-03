// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;

    address payable public immutable feeAccount; // account that recieves the fees
    uint256 public immutable feePercent; // fee percentage on sales
    Counters.Counter public itemCount;

    struct Item {
        uint256 itemId;
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        address payable owner;
        bool sold;
    }

    event MarketItemCreated(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        address indexed seller,
        address indexed owner,
        uint256 price
    );

    event MarketItemPurchased(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        address indexed seller,
        address indexed owner,
        uint256 price
    );

    // Tracks every token listed on the marketplace
    mapping(uint256 => Item) public marketplaceItems;

    constructor(uint256 _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    /**
     * @notice Create an item on the marketplace
     */
    function createItem(
        IERC721 _nft,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "ERROR: Price must be greater than 0.");

        itemCount.increment();
        uint256 currentItemCount = itemCount.current();

        // Transfer the ownership of the NFT to the `Marketplace`
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // Updating our `marketplaceItems` mapping
        marketplaceItems[currentItemCount] = Item(
            currentItemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            payable(address(this)),
            false
        );
        // Emit event
        emit MarketItemCreated(
            currentItemCount,
            address(_nft),
            _tokenId,
            payable(msg.sender),
            address(this),
            _price
        );
    }

    /**
     * @notice Purchasing a token from the Marketplace
     * @param _itemId ItemID of the marketplace item we're purchasing
     */
    function purchaseItem(uint256 _itemId) external payable nonReentrant {
        uint256 _totalPrice = getTotalPrice(_itemId);
        Item storage item = marketplaceItems[_itemId];

        // Performing checks
        require(
            _itemId > 0 && _itemId <= itemCount.current(),
            "ERROR: Item does not exist."
        );
        require(
            msg.value == _totalPrice,
            "ERROR: Not enough ether to cover the item price & market fee."
        );
        require(!item.sold, "ERROR: Following item is already sold.");

        // Pay seller & fee account
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);

        // Update the item
        item.sold = true;

        // Transfer NFT to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit MarketItemPurchased(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.seller,
            msg.sender,
            item.price
        );
    }

    /**
     * @notice Getting the total price of purchasing an NFT [Price + Fee]
     * @param _itemId Id of the item we're purchasing
     */
    function getTotalPrice(uint256 _itemId) public view returns (uint256) {
        return (marketplaceItems[_itemId].price * (100 + feePercent)) / 100;
    }

    modifier onlyOwner() {
        require(
            msg.sender == feeAccount,
            "ERROR: Only deployer can mint tokens."
        );
        _;
    }
}
