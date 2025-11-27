// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignFactory is EIP712, Ownable {
    
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

    bytes32 private constant CREATE_CAMPAIGN_TYPEHASH =
        keccak256("CreateCampaign(string title,uint256 targetAmount,uint256 deadline,uint256 nonce)");

    uint256 private nextId = 1;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256) public nonces;

    // --- EVENTS ---
    event CampaignCreated(
        uint256 indexed id,
        address indexed ngo,
        string title,
        uint256 targetAmount,
        uint256 deadline,
        uint256 createdAt
    );

    event DonationRecorded(uint256 indexed campaignId, uint256 amount, string paymentRef);
    
    // New Event: Listen for this in Next.js to trigger Stripe Payout
    event PayoutAuthorized(uint256 indexed campaignId, address indexed ngo, uint256 amount);
    
    // New Event: When auditor approves a phase
    event MilestoneStatusUpdated(uint256 indexed campaignId, uint256 newMilestoneIndex);

    constructor(address initialOwner) 
        EIP712("NGOPlatform", "1") 
        Ownable(initialOwner) 
    {}

    // 1. INFLOW: Backend records Stripe Donation
    function recordFiatDonation(uint256 campaignId, uint256 amount, string calldata paymentRef) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(!campaign.closed, "Campaign is closed");
        // require(block.timestamp < campaign.deadline, "Campaign expired"); // Optional check

        campaign.collectedAmount += amount;
        emit DonationRecorded(campaignId, amount, paymentRef);
    }

    // 2. MILESTONE LOGIC: Auditor (Admin) approves progress
    // Moves index from 0 -> 1 -> 2
    function approveMilestone(uint256 campaignId) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.currentMilestone < 2, "All milestones already approved");

        campaign.currentMilestone += 1;
        emit MilestoneStatusUpdated(campaignId, campaign.currentMilestone);
    }

    // 3. OUTFLOW CALCULATION: The 20/40/40 Rule
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

        // The maximum money they are ALLOWED to touch (based on Target)
        // Example: Target 100k. Phase 1. Limit = 20k.
        uint256 hardLimit = (c.targetAmount * allowedCapPercentage) / 100;

        // However, we can't withdraw more than what has been DONATED.
        // Example: Limit 20k. But only 5k donated. Withdrawable = 5k.
        uint256 availableFunds = c.collectedAmount;
        if (availableFunds > hardLimit) {
            availableFunds = hardLimit;
        }

        // Subtract what they have ALREADY taken
        if (availableFunds > c.withdrawnAmount) {
            return availableFunds - c.withdrawnAmount;
        } else {
            return 0;
        }
    }

    // 4. OUTFLOW TRIGGER: NGO requests money
    function requestPayout(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(msg.sender == campaign.ngo, "Only NGO can request payout");

        uint256 amountToRelease = getWithdrawableAmount(campaignId);
        require(amountToRelease > 0, "No funds available for withdrawal (Milestone Locked)");

        // Update state
        campaign.withdrawnAmount += amountToRelease;

        // Emit event for Backend to process Stripe Transfer
        emit PayoutAuthorized(campaignId, campaign.ngo, amountToRelease);
    }

    // 5. CAMPAIGN CREATION (Existing Logic)
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
}