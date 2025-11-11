// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import OpenZeppelin EIP-712
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CampaignFactory is EIP712 {
    struct Campaign {
        uint256 id;
        address ngo;
        string title;
        uint256 createdAt;
    }

    // EIP-712 Type Hash
    bytes32 private constant CREATE_CAMPAIGN_TYPEHASH = 
        keccak256("CreateCampaign(string title,address ngo,uint256 deadline, uint256 nonce)");
    
    uint256 private nextId = 1;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256) public nonces;
    
    event CampaignCreated(uint256 indexed id, address indexed ngo, string title, uint256 createdAt);

    constructor() EIP712("NGOPlatform", "1") {}

    // 🆕 NEW: EIP-712 signed function
    function createCampaignWithSignature(
        string memory title,
        uint256 deadline,
        uint256 nonce,
        bytes memory signature
    ) external returns (uint256) {
        // 1. Verify signature
        address ngo = _verifySignature(title, deadline, nonce, signature);
        
        // 2. Create campaign
        uint256 id = nextId++;
        campaigns[id] = Campaign({
            id: id,
            ngo: ngo,
            title: title,
            createdAt: block.timestamp
        });

        emit CampaignCreated(id, ngo, title, block.timestamp);
        return id;
    }

    // 🆕 NEW: Signature verification
    function _verifySignature(
        string memory title,
        uint256 deadline,
        uint256 nonce,
        bytes memory signature
    ) internal returns (address) {
        // Check deadline
        require(block.timestamp <= deadline, "Signature expired");
        
        // Increment nonce to prevent replay attacks
        nonces[msg.sender]++;
        
        // Recover signer
        bytes32 structHash = keccak256(
            abi.encode(
                CREATE_CAMPAIGN_TYPEHASH,
                keccak256(bytes(title)),
                msg.sender,  // The NGO address that will create campaign
                deadline,
                nonce
            )
        );
        
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, signature);
        
        require(signer != address(0), "Invalid signature");
        return signer;
    }

    // ✅ KEEP: Original function for backward compatibility
    function createCampaign(string memory title) external returns (uint256) {
        uint256 id = nextId++;
        campaigns[id] = Campaign({
            id: id,
            ngo: msg.sender,
            title: title,
            createdAt: block.timestamp
        });

        emit CampaignCreated(id, msg.sender, title, block.timestamp);
        return id;
    }

    function getCampaign(uint256 id) external view returns (Campaign memory) {
        return campaigns[id];
    }

    function getCampaignCount() external view returns (uint256) {
        return nextId - 1;
    }
    
    // 🆕 NEW: Get domain separator for frontend
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}