// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CampaignFactory {
    struct Campaign {
        uint256 id;
        address ngo;
        string title;
        uint256 createdAt;
    }

    uint256 private nextId = 1;
    mapping(uint256 => Campaign) public campaigns;
    event CampaignCreated(uint256 indexed id, address indexed ngo, string title, uint256 createdAt);

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
}
