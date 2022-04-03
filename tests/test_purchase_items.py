from brownie import accounts as a, Marketplace, NFT, Wei, reverts
import pytest

URI = "sample-uri"
ITEM_PRICE = Wei("2 ether")
FEE = (1 / 100) * ITEM_PRICE


@pytest.fixture
def contracts(Marketplace, NFT):
    nft_contract = NFT.deploy({"from": a[0]})
    marketplace_contract = Marketplace.deploy(1, {"from": a[0]})

    # Minting an NFT
    nft_contract.mint(URI, {"from": a[1]})
    # Authorising the Marketplace to manage our NFTs
    nft_contract.setApprovalForAll(marketplace_contract, True, {"from": a[1]})
    # Creating an item
    marketplace_contract.createItem(nft_contract, 1, ITEM_PRICE, {"from": a[1]})

    return [nft_contract, marketplace_contract]


# CHECKING WHETHER THE ITEM `sold` STATUS TURNS TO TRUE AFTER PURCHASE
def test_purchasing_updates_item_as_sold(contracts):
    marketplace = contracts[1]
    # Total Price of the Item (MarketFee + ItemPrice)
    totalPriceInWei = marketplace.getTotalPrice(1)
    # Purchasing the Item
    marketplace.purchaseItem(1, {"from": a[2], "value": totalPriceInWei})

    assert marketplace.marketplaceItems(1)["sold"] == True


# CHECKING WHETHER THE SELLER&DEPLOYER GET PAID AFTER THE PURCHASE
def test_seller_and_fee_account_get_paid(contracts):
    marketplace = contracts[1]

    # Fetch Initial Balances
    deployerInitialBalance = a[0].balance()
    sellerInitialBalance = a[1].balance()

    # Fetch an item's total price (market fees + item price)
    totalPriceInWei = marketplace.getTotalPrice(1)

    # Purchasing the Item
    marketplace.purchaseItem(1, {"from": a[2], "value": totalPriceInWei})

    deployerFinalBalance = a[0].balance()
    sellerFinalBalance = a[1].balance()

    assert deployerFinalBalance == deployerInitialBalance + FEE
    assert sellerFinalBalance == sellerInitialBalance + ITEM_PRICE


# CHECKING THE NEW OWNER OF THE NFT AFTER PURCHASE
def test_buyer_owns_nft_after_purchasing(contracts):
    nft, marketplace = contracts[0], contracts[1]
    # Total Price of the Item (MarketFee + ItemPrice)
    totalPriceInWei = marketplace.getTotalPrice(1)
    # Purchasing the Item
    marketplace.purchaseItem(1, {"from": a[2], "value": totalPriceInWei})

    # Testing whether the `new owner` is the BUYER
    assert nft.ownerOf(1) == a[2]


# TESTING WHETHER THE `MarketItemPurchased` FIRES
def test_MarketItemPurchased_event_fires(contracts):
    nft, marketplace = contracts[0], contracts[1]
    totalPriceInWei = marketplace.getTotalPrice(1)

    # a[2] purchases a listed item
    tx = marketplace.purchaseItem(1, {"from": a[2], "value": totalPriceInWei})

    assert tx.events["MarketItemPurchased"].values() == [
        1,  # MarketplaceItem Count
        nft,  # NFT Address
        1,  # Token Id
        a[1],  # Seller
        a[2],  # New Owner
        ITEM_PRICE,  # Item Price
    ]


# PURCHASING AN ITEM THAT DOESN'T EXIST
def test_purchase_invalid_item(contracts):
    marketplace = contracts[1]
    totalPriceInWei = marketplace.getTotalPrice(1)

    with reverts("ERROR: Item does not exist."):
        marketplace.purchaseItem(2, {"from": a[2], "value": totalPriceInWei})


# PURCHASING AN ITEM WITH AN AMOUNT LESS THAN THE TOTALPRICE
def test_purchase_invalid_amount(contracts):
    marketplace = contracts[1]
    totalPriceInWei = marketplace.getTotalPrice(1)

    with reverts("ERROR: Not enough ether to cover the item price & market fee."):
        marketplace.purchaseItem(1, {"from": a[2], "value": totalPriceInWei - 1})


# PURCHASING AN ITEM THAT IS ALREADY SOLD
def test_purchase_sold_item(contracts):
    marketplace = contracts[1]
    totalPriceInWei = marketplace.getTotalPrice(1)
    marketplace.purchaseItem(1, {"from": a[2], "value": totalPriceInWei})

    with reverts("ERROR: Following item is already sold."):
        marketplace.purchaseItem(1, {"from": a[2], "value": totalPriceInWei})
