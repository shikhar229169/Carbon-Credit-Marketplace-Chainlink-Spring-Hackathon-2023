// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

error CarbonMarketplace__invalidAdmin();
error CarbonMarketplace__duplicateAdmin();
error CarbonMarketplace__notAdmin();
error CarbonMarketplace__alreadyApproved();
error CarbonMarketplace__alreadyDeployed();
error CarbonMarketplace__invalidProjectId();
error CarbonMarketplace__alreadyNotApproved();
error CarbonMarketplace__notEnoughApprovals();

contract CarbonMarketplace {
    struct Project {
        address author;
        string projectName;
        string projectLink;
        bool accepted;
        uint256 approvals;
    }

    address[] private admins;
    mapping(address => bool) private isAdmin;
    uint256 private approvalsRequired;

    Project[] private projects;
    mapping(uint256 => mapping(address => bool)) approved;
    uint256 private totalProjects;
    uint256 private acceptedProjects;


    // Events
    event ProposalSubmitted(uint256 indexed projectId, address indexed author, string indexed projectName);
    event Approved(uint256 indexed projectId, address indexed validator);
    event Revoked(uint256 indexed projectId, address indexed validator);
    event ProposalAccepted(uint256 indexed projectId, address indexed admin);


    constructor(address[] memory _admins, uint256 _approvalsRequired) {
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


    function submitProposal(string memory projectName, string memory projectLink) external {
        uint256 id = totalProjects;
        totalProjects++;

        projects.push(Project(
            msg.sender,
            projectName,
            projectLink,
            false,
            0
        ));

        emit ProposalSubmitted(id, msg.sender, projectName);
    }

    function approve(uint256 projectId) external onlyAdmins projectExist(projectId) notApproved(projectId) notDeployed(projectId) {
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

        projects[projectId].accepted = true;
        acceptedProjects++;

        // Deploy the Project contract and transfer ownership to user

        emit ProposalAccepted(projectId, msg.sender);
    }

    function reviewProject(uint256 projectId) external onlyAdmins {
        // Timeout
        // Admin will check the climate conditions of the area, and will
        // reward the owner with tokens
        // on the basis of climate improvements
        // user can buy merchandise with these tokens
    }

    function getApprovedProjects() external view onlyAdmins returns (Project[] memory) {
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