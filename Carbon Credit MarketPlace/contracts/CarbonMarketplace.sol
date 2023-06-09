// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./UserCampaigns.sol";

interface IEmissionFeeds {
    function latestResponse() external view returns (bytes memory);
}

error CarbonMarketplace__invalidAdmin();
error CarbonMarketplace__duplicateAdmin();
error CarbonMarketplace__notAdmin();
error CarbonMarketplace__alreadyApproved();
error CarbonMarketplace__alreadyDeployed();
error CarbonMarketplace__invalidProjectId();
error CarbonMarketplace__alreadyNotApproved();
error CarbonMarketplace__notEnoughApprovals();
error CarbonMarketplace__invalidAuthor();
error CarbonMarketplace__projectNotApproved();
error CarbonMarketplace__reviewNotRequired();

contract CarbonMarketplace is ERC20 {
    struct Emission {
        int256 CO;
        int256 NO2;
        int256 SO2;
        int256 PM2_5;
        int256 PM10;
    }

    struct Project {
        address author;
        string projectName;
        string projectLink;
        string zipCode;
        bool accepted;
        uint256 approvals;
        address authorCampaignContract;
        Emission latestEmissionFeeds;
        uint256 latestReviewTimestamp;
    }


    address[] public admins;
    mapping(address => bool) private isAdmin;
    uint256 public approvalsRequired;

    Project[] public projects;
    mapping(uint256 => mapping(address => bool)) public approved;
    uint256 public totalProjects;
    uint256 public acceptedProjects;

    IEmissionFeeds public emissionFeeds;
    IWeatherFeeds public weatherFeeds;
    uint256 public reviewInterval;

    // Events
    event ProposalSubmitted(uint256 indexed projectId, address indexed author, string indexed projectName);
    event Approved(uint256 indexed projectId, address indexed validator);
    event Revoked(uint256 indexed projectId, address indexed validator);
    event ProposalAccepted(uint256 indexed projectId, address indexed admin);
    event TokenRewarded(uint256 indexed projectId, address indexed author, uint256 indexed tokens);


    constructor(address[] memory _admins, uint256 _approvalsRequired, address _emissionFeeds, address _weatherFeeds, uint256 _reviewInterval) ERC20("Carbon Coin", "CC") {
        require(_approvalsRequired > 0 && _approvalsRequired <= _admins.length, "Invalid number of approvers");
        require(_admins.length > 0, "Atleast one admin required");

        for (uint256 i=0; i<_admins.length; i++) {
            if (_admins[i] == address(0)) {
                revert CarbonMarketplace__invalidAdmin();
            }

            if (isAdmin[_admins[i]]) {
                revert CarbonMarketplace__duplicateAdmin();
            }

            admins.push(_admins[i]);
            isAdmin[admins[i]] = true;
        }

        approvalsRequired = _approvalsRequired;
        totalProjects = 0;
        acceptedProjects = 0;

        emissionFeeds = IEmissionFeeds(_emissionFeeds);
        weatherFeeds = IWeatherFeeds(_weatherFeeds);
        reviewInterval = _reviewInterval;
    }

    modifier onlyAdmins {
        if (!isAdmin[msg.sender]) {
            revert CarbonMarketplace__notAdmin();
        }
        _;
    }

    modifier projectExist(uint256 id) {
        if (id >= projects.length) {
            revert CarbonMarketplace__invalidProjectId();
        }
        _;
    }

    modifier notApproved(uint256 id) {
        if (approved[id][msg.sender]) {
            revert CarbonMarketplace__alreadyApproved();
        }
        _;
    }

    modifier isApproved(uint256 id) {
        if (!approved[id][msg.sender]) {
            revert CarbonMarketplace__alreadyNotApproved();
        }
        _;
    }

    modifier notDeployed(uint256 id) {
        if (projects[id].accepted) {
            revert CarbonMarketplace__alreadyDeployed();
        }
        _;
    }


    function submitProposal(string memory projectName, string memory projectLink, string memory pinCode, string memory countryCode) external {
        if (msg.sender != tx.origin) {
            revert CarbonMarketplace__invalidAuthor();
        }

        uint256 id = totalProjects;
        totalProjects++;

        projects.push(Project(
            msg.sender,
            projectName,
            projectLink,
            string.concat(pinCode, ',', countryCode),
            false,
            0,
            address(0),
            Emission(0,0,0,0,0),
            0
        ));

        emit ProposalSubmitted(id, msg.sender, projectName);
    }

    function giveApproval(uint256 projectId) external onlyAdmins projectExist(projectId) notApproved(projectId) notDeployed(projectId) {
        approved[projectId][msg.sender] = true;
        projects[projectId].approvals++;

        emit Approved(projectId, msg.sender);
    }

    function revoke(uint256 projectId) external onlyAdmins projectExist(projectId) notDeployed(projectId) isApproved(projectId) {
        approved[projectId][msg.sender] = false;
        projects[projectId].approvals--;

        emit Revoked(projectId, msg.sender);
    }

    function deployProject(uint256 projectId) external onlyAdmins projectExist(projectId) notDeployed(projectId) {
        if (projects[projectId].approvals < approvalsRequired) {
            revert CarbonMarketplace__notEnoughApprovals();
        }

        Project storage authorProject = projects[projectId];
        authorProject.accepted = true;
        acceptedProjects++;

        bytes memory data = emissionFeeds.latestResponse();
        (int256 co, int256 no2, int256 so2, int256 pm2_5, int256 pm10) = abi.decode(data, (int256, int256, int256, int256, int256));
        projects[projectId].latestEmissionFeeds = Emission(co, no2, so2, pm2_5, pm10);
        projects[projectId].latestReviewTimestamp = block.timestamp;

        authorProject.authorCampaignContract = address(new UserCampaign(
            projectId, 
            authorProject.projectName, 
            authorProject.author,
            address(weatherFeeds)
        ));

        emit ProposalAccepted(projectId, msg.sender);
    }

    function reviewProject(uint256 projectId) external onlyAdmins projectExist(projectId) {
        if (!projects[projectId].accepted) {
            revert CarbonMarketplace__projectNotApproved();
        }

        Project storage userProject = projects[projectId];

        if ((block.timestamp - userProject.latestReviewTimestamp) < reviewInterval) {
            revert CarbonMarketplace__reviewNotRequired();
        }

        userProject.latestReviewTimestamp = block.timestamp;

        bytes memory data = emissionFeeds.latestResponse();
        (int256 co, int256 no2, int256 so2, int256 pm2_5, int256 pm10) = abi.decode(data, (int256, int256, int256, int256, int256));

        uint256 totalTokens = 0;
        if (co < userProject.latestEmissionFeeds.CO) {
            totalTokens += 10;
        }
        if (no2 < userProject.latestEmissionFeeds.NO2) {
            totalTokens += 10;
        }
        if (so2 < userProject.latestEmissionFeeds.SO2) {
            totalTokens += 10;
        }
        if (pm2_5 < userProject.latestEmissionFeeds.PM2_5) {
            totalTokens += 10;
        }
        if (pm10 < userProject.latestEmissionFeeds.PM10) {
            totalTokens += 10;
        }
        
        _mint(userProject.author, totalTokens * 1e18);

        emit TokenRewarded(projectId, userProject.author, totalTokens);

        userProject.latestEmissionFeeds = Emission(co, no2, so2, pm2_5, pm10);
    }

    function getApprovedProjects() external view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](acceptedProjects);
        
        uint256 counter = 0;
        for (uint256 i=0; i<projects.length; i++) {
            if (projects[i].accepted) {
                allProjects[counter] = projects[i];
                counter++;
            }
        }

        return allProjects;
    }

    function getNotApprovedProjects() external view onlyAdmins returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projects.length - acceptedProjects);
        
        uint256 counter = 0;
        for (uint256 i=0; i<projects.length; i++) {
            if (!projects[i].accepted) {
                allProjects[counter] = projects[i];
                counter++;
            }
        }

        return allProjects;
    }

    function getProjectAt(uint256 projectId) external projectExist(projectId) view returns (Project memory) {
        return projects[projectId];
    }
}