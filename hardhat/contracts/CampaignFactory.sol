// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // 1. Import Ownable

// 2. Inherit from Ownable
contract CampaignFactory is EIP712, Ownable {
    struct Campaign {
        uint256 id;
        address ngo;
        string title;
        uint256 targetAmount;
        uint256 collectedAmount;
        uint256 deadline;
        uint256 createdAt;
        bool closed;
    }

    // Minimal struct: title, targetAmount, deadline, nonce
    bytes32 private constant CREATE_CAMPAIGN_TYPEHASH =
        keccak256("CreateCampaign(string title,uint256 targetAmount,uint256 deadline,uint256 nonce)");

    uint256 private nextId = 1;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256) public nonces;

    event CampaignCreated(
        uint256 indexed id,
        address indexed ngo,
        string title,
        uint256 targetAmount,
        uint256 deadline,
        uint256 createdAt
    );

    event DonationRecorded(uint256 indexed campaignId, uint256 amount, string paymentRef);

    // 3. Update Constructor: Accept initialOwner and pass to Ownable
    constructor(address initialOwner) 
        EIP712("NGOPlatform", "1") 
        Ownable(initialOwner) 
    {}

    // 4. Protect this function with 'onlyOwner'
    // This ensures only your backend (the owner) can record fiat payments on-chain.
    function recordFiatDonation(uint256 campaignId, uint256 amount, string calldata paymentRef) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(!campaign.closed, "Campaign is closed");
        
        // Optional: You can comment this out if you want to allow late donations
        require(block.timestamp < campaign.deadline, "Campaign expired");

        campaign.collectedAmount += amount;
        
        emit DonationRecorded(campaignId, amount, paymentRef);
    }

    function createCampaignWithSignature(
        string memory title,
        uint256 targetAmount,
        uint256 deadline,
        uint256 nonce,
        bytes memory signature
    ) external returns (uint256) {
        address signer = _recoverSigner(title, targetAmount, deadline, nonce, signature);
        require(signer != address(0), "Invalid signature");

        require(nonce == nonces[signer], "Bad nonce");
        nonces[signer] += 1;

        uint256 id = nextId++;
        campaigns[id] = Campaign({
            id: id,
            ngo: signer,
            title: title,
            targetAmount: targetAmount,
            collectedAmount: 0,
            deadline: deadline,
            createdAt: block.timestamp,
            closed: false
        });

        emit CampaignCreated(id, signer, title, targetAmount, deadline, block.timestamp);
        return id;
    }

    function _recoverSigner(
        string memory title,
        uint256 targetAmount,
        uint256 deadline,
        uint256 nonce,
        bytes memory signature
    ) internal view returns (address) {
        bytes32 structHash = keccak256(
            abi.encode(
                CREATE_CAMPAIGN_TYPEHASH,
                keccak256(bytes(title)),
                targetAmount,
                deadline,
                nonce
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        return ECDSA.recover(digest, signature);
    }

    function getCampaign(uint256 id) external view returns (Campaign memory) {
        return campaigns[id];
    }

    function getCampaignCount() external view returns (uint256) {
        return nextId - 1;
    }

    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}