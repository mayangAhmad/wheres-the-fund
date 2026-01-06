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
        uint256 collectedAmount;      // Total donated (including escrow)
        uint256 releasedAmount;       // Total released to NGO (direct + escrow releases)
        uint256 escrowBalance;        // Currently held in escrow
        uint256 currentMilestone;     // 0 = M1, 1 = M2, 2 = M3
        uint256 deadline;
        uint256 createdAt;
        bool closed;
    }

    //  Track individual milestone allocations
    struct MilestoneAllocation {
        uint256 targetAmount;         // e.g., 20% of total goal
        uint256 directReleased;       // Amount released directly to NGO
        uint256 escrowHeld;           // Amount held in escrow for this milestone
        uint256 escrowReleased;       // Amount released from escrow after approval
        string ipfsCID;               // Proof of work CID
        bool approved;                // Whether milestone was approved
    }

    // CampaignID => MilestoneIndex => Allocation
    mapping(uint256 => mapping(uint256 => MilestoneAllocation)) public milestoneAllocations;

    // 2. Constants
    bytes32 private constant CREATE_CAMPAIGN_TYPEHASH =
        keccak256("CreateCampaign(string title,uint256 targetAmount,uint256 deadline,uint256 nonce)");

    bytes32 private constant DONATE_TYPEHASH =
        keccak256("Donate(uint256 onChainId,uint256 amount,string paymentRef,uint256 nonce)");

    // 3. State Variables
    uint256 private nextId = 1;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256) public nonces;

    // 4. Events
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
        string paymentRef,
        bool isEscrow  
    );

    event EscrowReleased(
        uint256 indexed campaignId,
        uint256 milestoneIndex,
        uint256 amount,
        string ipfsCID
    );
    
    event MilestoneApproved(
        uint256 indexed campaignId, 
        uint256 milestoneIndex,
        string ipfsCID,
        uint256 escrowReleased
    );

    event CampaignClosed(
        uint256 indexed campaignId,
        uint256 totalCollected,
        uint256 totalReleased
    );

    // 5. Constructor
    constructor(address initialOwner) 
        EIP712("NGOPlatform", "1") 
        Ownable(initialOwner) 
    {}

    // 6. Functions

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
            releasedAmount: 0,
            escrowBalance: 0,
            currentMilestone: 0,  // M1 starts active
            deadline: deadline,
            createdAt: block.timestamp,
            closed: false
        });

        // Initialize milestone allocations (20-40-40 split)
        milestoneAllocations[id][0].targetAmount = (targetAmount * 20) / 100;  // M1: 20%
        milestoneAllocations[id][1].targetAmount = (targetAmount * 40) / 100;  // M2: 40%
        milestoneAllocations[id][2].targetAmount = (targetAmount * 40) / 100;  // M3: 40%

        emit CampaignCreated(id, signer, title, targetAmount, deadline, block.timestamp);
        return id;
    }

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
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        
        // Update total collected
        campaign.collectedAmount += amount;
        
        // Determine if donation goes to escrow or direct release
        // This is tracked off-chain in your webhook - blockchain just records the donation
        // The actual escrow/direct split is handled by your Stripe logic
        
        // For simplicity, we emit the event and let off-chain systems handle the split
        emit DonationRecorded(onChainId, donor, amount, paymentRef, false);
    }

    // --- MILESTONE APPROVAL (Called by Admin after reviewing proof) ---
    function approveMilestone(uint256 campaignId, string calldata ipfsCID) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        require(campaign.currentMilestone < 3, "All milestones approved");

        uint256 currentIndex = campaign.currentMilestone;
        MilestoneAllocation storage allocation = milestoneAllocations[campaignId][currentIndex];
        
        // Mark milestone as approved and store proof
        allocation.approved = true;
        allocation.ipfsCID = ipfsCID;
        
        // The actual escrow release amount is tracked off-chain and passed via event
        // Your backend updates the database accordingly
        
        // Move to next milestone
        campaign.currentMilestone += 1;
        
        //Close campaign if all milestones approved
        if (campaign.currentMilestone == 3) {
            campaign.closed = true;
            emit CampaignClosed(campaignId, campaign.collectedAmount, campaign.releasedAmount);
        }
        
        emit MilestoneApproved(campaignId, currentIndex, ipfsCID, allocation.escrowHeld);
    }

    //Record escrow release (called by your backend after admin approval)
    function recordEscrowRelease(
        uint256 campaignId,
        uint256 milestoneIndex,
        uint256 amount
    ) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        
        MilestoneAllocation storage allocation = milestoneAllocations[campaignId][milestoneIndex];
        require(allocation.approved, "Milestone not approved");
        
        //Update balances
        allocation.escrowReleased += amount;
        campaign.escrowBalance -= amount;
        campaign.releasedAmount += amount;
        
        emit EscrowReleased(campaignId, milestoneIndex, amount, allocation.ipfsCID);
    }

    //Update campaign balances (called by webhook after donation)
    function updateCampaignBalances(
        uint256 campaignId,
        uint256 directReleased,
        uint256 escrowAdded
    ) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.id != 0, "Campaign does not exist");
        
        campaign.releasedAmount += directReleased;
        campaign.escrowBalance += escrowAdded;
    }

    // --- VIEW FUNCTIONS ---
    function getCampaignDetails(uint256 campaignId) external view returns (
        uint256 id,
        address ngo,
        string memory title,
        uint256 targetAmount,
        uint256 collectedAmount,
        uint256 releasedAmount,
        uint256 escrowBalance,
        uint256 currentMilestone,
        bool closed
    ) {
        Campaign memory c = campaigns[campaignId];
        return (
            c.id,
            c.ngo,
            c.title,
            c.targetAmount,
            c.collectedAmount,
            c.releasedAmount,
            c.escrowBalance,
            c.currentMilestone,
            c.closed
        );
    }

    function getMilestoneDetails(uint256 campaignId, uint256 milestoneIndex) external view returns (
        uint256 targetAmount,
        uint256 directReleased,
        uint256 escrowHeld,
        uint256 escrowReleased,
        string memory ipfsCID,
        bool approved
    ) {
        MilestoneAllocation memory allocation = milestoneAllocations[campaignId][milestoneIndex];
        return (
            allocation.targetAmount,
            allocation.directReleased,
            allocation.escrowHeld,
            allocation.escrowReleased,
            allocation.ipfsCID,
            allocation.approved
        );
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

    function getCampaignCount() external view returns (uint256) {
        return nextId - 1;
    }

    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}