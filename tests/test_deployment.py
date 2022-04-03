from brownie import accounts as a, Marketplace, NFT
import pytest

URI = "sample-uri"


@pytest.fixture
def contracts(Marketplace, NFT):
    nft_contract = NFT.deploy({"from": a[0]})
    marketplace_contract = Marketplace.deploy(1, {"from": a[0]})
    return [nft_contract, marketplace_contract]


# DEPLOYMENT TESTS
def test_tracks_name_and_symbol(contracts):
    nft = contracts[0]
    assert nft.name() == "Magic Potions"
    assert nft.symbol() == "MAGIC"


def test_fee_account_and_fee_price(contracts):
    marketplace = contracts[1]
    assert marketplace.feeAccount() == a[0]
    assert marketplace.feePercent() == 1


# MARKETPLACE TESTS
def test_tracks_minted_NFT(contracts):
    nft = contracts[0]
    # Minting an NFT
    nft.mint(URI, {"from": a[1]})

    assert nft.tokenCount() == 1  # Current tokenId
    assert nft.balanceOf(a[1]) == 1  # Number of tokens owned by a[1]
    assert nft.tokenURI(1) == URI  # URI of the minted NFT

    # Minting an NFT again from a different address
    nft.mint(URI, {"from": a[2]})

    assert nft.tokenCount() == 2
    assert nft.balanceOf(a[2]) == 1
    assert nft.tokenURI(2) == URI
