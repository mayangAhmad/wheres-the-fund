// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CampaignFactory is EIP712 {
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

    constructor() EIP712("NGOPlatform", "1") {}

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
