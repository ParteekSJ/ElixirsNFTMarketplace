from brownie import accounts as a, Marketplace, NFT, Wei, reverts
import pytest

URI = "sample-uri"


@pytest.fixture
def contracts(Marketplace, NFT):
    nft_contract = NFT.deploy({"from": a[0]})
    marketplace_contract = Marketplace.deploy(1, {"from": a[0]})

    # Minting an NFT
    nft_contract.mint(URI, {"from": a[1]})
    # Authorising the Marketplace to manage our NFTs
    nft_contract.setApprovalForAll(marketplace_contract, True, {"from": a[1]})
    return [nft_contract, marketplace_contract]


def test_MarketItemCreated_event_fires(contracts):
    nft, marketplace = contracts[0], contracts[1]

    # Listing the item on the `Marketplace`
    tx = marketplace.createItem(nft, 1, Wei("1 ether"), {"from": a[1]})

    assert tx.events["MarketItemCreated"].values() == [
        1,  # MarketplaceItem Count
        nft,  # NFT Address
        1,  # Token Id
        a[1],  # Seller [Address putting it on the Marketplace]
        marketplace,  # Owner [Temporary, until someone buys]
        Wei("1 ether"),  # Listed Price
    ]


def test_nft_transfers_from_seller_to_marketplace(contracts):
    nft, marketplace = contracts[0], contracts[1]
    # Listing the item on the `Marketplace`
    marketplace.createItem(nft, 1, Wei("1 ether"), {"from": a[1]})

    assert nft.ownerOf(1) == marketplace


def test_marketplace_item_count_increases(contracts):
    nft, marketplace = contracts[0], contracts[1]
    marketplace.createItem(nft, 1, Wei("1 ether"), {"from": a[1]})

    assert marketplace.itemCount() == 1


def test_marketplace_mapping_gets_updated(contracts):
    nft, marketplace = contracts[0], contracts[1]
    marketplace.createItem(nft, 1, Wei("1 ether"), {"from": a[1]})

    # Retrieving the newly listed token from the mapping
    item = marketplace.marketplaceItems(1)

    assert item["itemId"] == 1
    assert item["nft"] == nft
    assert item["tokenId"] == 1
    assert item["seller"] == a[1]
    assert item["owner"] == marketplace
    assert item["price"] == Wei("1 ether")


def test_invalid_listing_price(contracts):
    nft, marketplace = contracts[0], contracts[1]
    with reverts("ERROR: Price must be greater than 0."):
        marketplace.createItem(nft, 1, Wei("0 ether"), {"from": a[1]})
