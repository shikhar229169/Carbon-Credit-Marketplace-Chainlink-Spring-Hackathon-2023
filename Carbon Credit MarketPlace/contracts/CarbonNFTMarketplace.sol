// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./CarbonMarketplace.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error CarbonNFTMarketplace__minOneNFTShouldBeAdded();
error CarbonNFTMarketplace__shouldSendExactCostForNFT();
error CarbonNFTMarketplace__invalidTokenId();
error CarbonNFTMarketplace__nftHasNoOwner();
error CarbonNFTMarketplace__notAdmin();
error CarbonNFTMarketplace__invalidNftIdx();
error CarbonNFTMarketplace__newPriceCantBeSameAsOldPrice();

contract CarbonNFTMarketplace is ERC721 {
    struct NFT {
        string tokenURI;
        uint256 cost;
    }

    CarbonMarketplace private carbonMarketPlace;

    uint256 private s_tokenCounter;
    NFT[] private s_NFTs;
    mapping(uint256 => uint256) private s_tokenIdToNFTIdx;


    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed owner);
    event newNFTAdded(uint256 indexed nftIndex);
    event priceChanged(uint256 indexed nftIdx, uint256 indexed newPrice);

    constructor(string[] memory tokenURIs, uint256[] memory costs, address carbonMarketPlaceAddress) ERC721("Carbon Coin NFT", "CCN") {
        if (tokenURIs.length == 0) {
            revert CarbonNFTMarketplace__minOneNFTShouldBeAdded();
        } 

        require(tokenURIs.length == costs.length, "tokenURIs and costs array must be of same size");

        s_tokenCounter = 0;
        
        for (uint256 i=0; i<tokenURIs.length; i++) {
            s_NFTs.push(NFT({
                tokenURI: tokenURIs[i],
                cost: costs[i]
            }));
        }

        carbonMarketPlace = CarbonMarketplace(carbonMarketPlaceAddress);
    }
    
    modifier onlyAdmins() {
        if (!carbonMarketPlace.isAdmin(msg.sender)) {
            revert CarbonNFTMarketplace__notAdmin();
        }
        _;
    }

    function _setTokenIdx(uint256 tokenId, uint256 nftIdx) private {
        if (tokenId >= s_tokenCounter) {
            revert CarbonNFTMarketplace__invalidTokenId();
        }

        if (_ownerOf(tokenId) == address(0)) {
            revert CarbonNFTMarketplace__nftHasNoOwner();
        }

        s_tokenIdToNFTIdx[tokenId] = nftIdx;
    }

    function buyNFT(uint256 idx) public {
        if (idx >= s_NFTs.length) {
            revert CarbonNFTMarketplace__invalidNftIdx();
        }

        carbonMarketPlace.transferFrom(msg.sender, address(this), s_NFTs[idx].cost);
        uint256 tokenId = s_tokenCounter;
        s_tokenCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenIdx(tokenId, idx);

        emit NFTMinted(tokenId, msg.sender);
    }

    function addNFT(string memory _tokenURI, uint256 _cost) public onlyAdmins {
        s_NFTs.push(NFT({
            tokenURI: _tokenURI,
            cost: _cost
        }));

        emit newNFTAdded(s_NFTs.length - 1);
    }

    function changePrice(uint256 nftIdx, uint256 newPrice) public onlyAdmins {
        if (nftIdx >= s_NFTs.length) {
            revert CarbonNFTMarketplace__invalidNftIdx();
        }

        if (s_NFTs[nftIdx].cost == newPrice) {
            revert CarbonNFTMarketplace__newPriceCantBeSameAsOldPrice();
        }

        s_NFTs[nftIdx].cost = newPrice;

        emit priceChanged(nftIdx, newPrice);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (tokenId >= s_tokenCounter) {
            revert CarbonNFTMarketplace__invalidTokenId();
        }

        return s_NFTs[s_tokenIdToNFTIdx[tokenId]].tokenURI;
    }

    function getTokenCounter() external view returns (uint256) {
        return s_tokenCounter;
    }

    function getNFTAtIdx(uint256 idx) external view returns (NFT memory) {
        return s_NFTs[idx];
    }

    function getTokenIdToNFTIdx(uint256 tokenId) external view returns (uint256) {
        return s_tokenIdToNFTIdx[tokenId];
    }

    function getAllNft() external view returns (NFT[] memory) {
        return s_NFTs;
    }

    function getCarbonMarketplace() external view returns (address) {
        return address(carbonMarketPlace);
    }
}