// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface IWeatherFeeds {
    function latestResponse() external view returns (bytes memory);
}

error UserCampaign__notOwner();
error UserCampaign__invalidOwner();
error UserCampaign__notEnoughETH();
error UserCampaign__ownerCantSendETH();
error UserCampaign__txnFailed();

contract UserCampaign {
    struct Logs {
        uint256 timestamp;
        string caption;
        string location;
        string currentWeather;
    }

    uint256 public projectID;
    string public projectName;
    address public immutable owner;
    address[] public donators;
    mapping(address => uint256) public donationsBy;
    Logs[] public logs;
    IWeatherFeeds public weatherFeeds;
    
    // Events
    event donationsReceived(address indexed donator, uint256 indexed amount);
    event logsAdded(string indexed caption, string indexed location, uint256 indexed timestamp);
    event withdrawn(address indexed owner, uint256 indexed amount);

    constructor(uint256 _id, string memory _projectName, address author, address _weatherFeeds) {
        projectID = _id;
        projectName = _projectName;
        owner = author;
        weatherFeeds = IWeatherFeeds(_weatherFeeds);
    }

    modifier onlyOwner {
        if (msg.sender != owner) {
            revert UserCampaign__notOwner();
        }
        _;
    }

    function addLogs(string memory caption, string memory location) external onlyOwner {
        // take the weather from contract
        string memory weather = string(weatherFeeds.latestResponse());

        logs.push(Logs(
            block.timestamp,
            caption,
            location,
            weather
        ));

        emit logsAdded(caption, location, block.timestamp);
    }

    function donateToCampaign() external payable {
        if (msg.value == 0) {
            revert UserCampaign__notEnoughETH();
        }

        if (msg.sender == owner) {
            revert UserCampaign__ownerCantSendETH();
        }

        if (donationsBy[msg.sender] == 0) {
            donators.push(msg.sender);
        }

        donationsBy[msg.sender] += msg.value;

        emit donationsReceived(msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;

        if (amount == 0) {
            revert UserCampaign__notEnoughETH();
        }

        (bool success, ) = payable(owner).call{value: amount}("");

        if (!success) {
            revert UserCampaign__txnFailed();
        }

        emit withdrawn(owner, amount);
    }

    function getAllDonations() public view returns (address[] memory, uint256[] memory) {
        uint256[] memory amountDonated = new uint256[](donators.length);

        for (uint256 i=0; i<donators.length; i++) {
            amountDonated[i] = donationsBy[donators[i]];
        }

        return (donators, amountDonated);
    }

    function getAllLogs() public view returns (Logs[] memory) {
        return logs;
    }
}