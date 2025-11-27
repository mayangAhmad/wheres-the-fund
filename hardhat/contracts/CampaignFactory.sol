// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignFactory is EIP712, Ownable {
    
    // 1. Structs
    struct Campaign {
        uint256 id;
        address ngo;
        string title;
        uint256 targetAmount;
        uint256 collectedAmount; // Total donations recorded
        uint256 withdrawnAmount; // Total released to NGO
        uint256 currentMilestone; // 0 = Phase 1, 1 = Phase 2, 2 = Phase 3
        uint256 deadline;
        uint256 createdAt;
        bool closed;
    }

    // 2. Constants
    bytes32 private constant CREATE_CAMPAIGN_TYPEHASH =
        keccak256("CreateCampaign(string title,uint256 targetAmount,uint256 deadline,uint256 nonce)");

    bytes32 private constant DONATE_TYPEHASH =
        keccak256("Donate(uint256 onChainId,uint256 amount,string paymentRef,uint256 nonce)");

    // 3. State Variables
    uint256 private nextId = 1;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256) public nonces;

    // 4. Events (Must be defined before usage)
    event CampaignCreated(
        uint256 indexed id,
        address indexed ngo,
        string title,
        uint256 targetAmount,
        uint256 deadline,
        uint256 createdAt
    );

    event DonationRecorded(
        uint256 indexed onChainId, 
        address indexed donor, 
        uint256 amount, 
        string paymentRef
    );

    event PayoutAuthorized(
        uint256 indexed campaignId, 
        address indexed ngo, 
        uint256 amount
    );
    
    event MilestoneStatusUpdated(
        uint256 indexed campaignId, 
        uint256 newMilestoneIndex
    );

    // 5. Constructor
    constructor(address initialOwner) 
        EIP712("NGOPlatform", "1") 
        Ownable(initialOwner) 
    {}

    // 6. Functions

    // --- DONATION LOGIC ---
    function donateWithSignature(
        uint256 onChainId,
        uint256 amount,
        string memory paymentRef,
        uint256 nonce,
        bytes memory signature
    ) external {
        address donor = _recoverDonationSigner(onChainId, amount, paymentRef, nonce, signature);
        require(donor != address(0), "Invalid signature");

        require(nonces[donor] == nonce, "Invalid nonce");
        nonces[donor]++;

        Campaign storage campaign = campaigns[onChainId];
        require(campaign.id != 0, "Campaign does not exist");
        require(!campaign.closed, "Campaign is closed");
        
        campaign.collectedAmount += amount;
        
        emit DonationRecorded(onChainId, donor, amount, paymentRef);
    }

    // --- MILESTONE LOGIC ---
    function approveMilestone(uint256 campaignId) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.currentMilestone < 2, "All milestones already approved");

        campaign.currentMilestone += 1;
        emit MilestoneStatusUpdated(campaignId, campaign.currentMilestone);
    }

    // --- WITHDRAWAL LOGIC ---
    function getWithdrawableAmount(uint256 campaignId) public view returns (uint256) {
        Campaign memory c = campaigns[campaignId];
        if (c.id == 0) return 0;

        // Calculate CAP based on Milestone Status
        uint256 allowedCapPercentage;

        if (c.currentMilestone == 0) {
            allowedCapPercentage = 20; // Phase 1: Cap at 20%
        } else if (c.currentMilestone == 1) {
            allowedCapPercentage = 60; // Phase 2: Cap at 20% + 40% = 60%
        } else {
            allowedCapPercentage = 100; // Phase 3: Cap at 100%
        }

        // Calculate limits
        uint256 hardLimit = (c.targetAmount * allowedCapPercentage) / 100;
        uint256 availableFunds = c.collectedAmount;
        
        if (availableFunds > hardLimit) {
            availableFunds = hardLimit;
        }

        if (availableFunds > c.withdrawnAmount) {
            return availableFunds - c.withdrawnAmount;
        } else {
            return 0;
        }
    }

    function requestPayout(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(msg.sender == campaign.ngo, "Only NGO can request payout");

        uint256 amountToRelease = getWithdrawableAmount(campaignId);
        require(amountToRelease > 0, "No funds available for withdrawal");

        // Update state
        campaign.withdrawnAmount += amountToRelease;

        // Emit event for Backend
        emit PayoutAuthorized(campaignId, campaign.ngo, amountToRelease);
    }

    // --- CAMPAIGN CREATION ---
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
            withdrawnAmount: 0,    // Init at 0
            currentMilestone: 0,   // Init at Phase 1 (Index 0)
            deadline: deadline,
            createdAt: block.timestamp,
            closed: false
        });

        emit CampaignCreated(id, signer, title, targetAmount, deadline, block.timestamp);
        return id;
    }

    // --- HELPERS ---
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

    function _recoverDonationSigner(
        uint256 onChainId,
        uint256 amount,
        string memory paymentRef,
        uint256 nonce,
        bytes memory signature
    ) internal view returns (address) {
        bytes32 structHash = keccak256(
            abi.encode(
                DONATE_TYPEHASH,
                onChainId,
                amount,
                keccak256(bytes(paymentRef)),
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