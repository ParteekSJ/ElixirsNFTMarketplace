from brownie import accounts as a, NFT, Marketplace, network, config

DEVELOPMENT_NETWORKS = ["ganache", "development"]
PRODUCTION_NETWORKS = ["rinkeby-alchemy"]


def get_account():
    if network.show_active() in PRODUCTION_NETWORKS:
        return a.add(config["wallets"]["from_key"])
    else:
        return a[0]


def main():
    # Getting the account based on the network
    account = get_account()
    # Deploying the NFT contract
    nft = NFT.deploy({"from": account})
    # Deploying the Marketplace contract with a 1% listing fee
    marketplace = Marketplace.deploy(1, {"from": account})

    print("NFT DEPLOYED AT", nft)
    print("MARKETPLACE DEPLOYED AT", marketplace)
