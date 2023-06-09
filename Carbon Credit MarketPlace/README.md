
# Project Title
Carbon MarketPlace

# Project Overview
This project aims to help reduce carbon emissions and to tackle from climate change, which includes users to submit their Proposals regarding preventions from climate change. The people who wants to come forward and take initiative towards contributing to prevention of climate change can submit their proposal to the Carbon Marketplace contract. The admins of the carbon marketplace contract will then verify the authencity of the user and when the proposal is verified, a dedicated user campaign contract is deployed for the person who submitted the proposal where they can get funding for their project, add their daily logs.
At fixed intervals the admins of the market place contract can run the regular review for projects and can check the current emission feeds with the previous feeds and if their is improvements they will reward ERC20 Carbon Coin tokens.
It uses chainlink functions to get the carbon emission feeds and weather feeds.
There is an already deployed automated consumer contract which fetches these feeds.

Deployed Automated Consumer Contract at address on Polygon Mumbai Network:

```bash
  emissionFeeds: 0x12D48b7Fa83dCF26b91591A63349048173c6a288
  weatherFeeds:  0x60e55982f7DF115D58eae49E631eE2FdC8aB0Ef6
```



## Installing packages
```bash
  yarn install
```

## Deployment

- To deploy on hardhat network
```bash
  yarn hardhat deploy
```
- To deploy on polygon mumbai network
```bash
  yarn hardhat deploy --network mumbai --tags main
```


## Running Tests

To run tests locally on hardhat network, run the following command
```bash
  yarn hardhat test
```
To get the coverage, run
```bash
  yarn hardhat coverage
```

# Documentation
## CarbonMarketplace
CarbonMarketplace Contract allows user to register their proposals which aims to reduce carbon emissions, and the admins can verify the proposal once it gets verified and approved by mininum number of admins, they will deploy a dedicated userCampaign contract for that project.

### 1. To submit proposal
```bash
submitProposal(string memory projectName, string memory projectLink, string memory pincode, string memory countryCode)
```
- projectName- The name for your project
- projectLink- A link that contains the proposal for your project and other related information
- pincode- Pincode of your location, where you will work towards the project
- countryCode - Your country code in iso 3166 format

### 2. To give approval to Proposal
    
It allows the admins to give approvals to the proposal. The proposal needs to get a certain number of approvals from admin.
```bash
  giveApproval(uint256 projectId)
```
- projectId - The id of the project allocated when user submitted the proposal for project.


### 3. To revoke approval from a Proposal

It allows the admins to revoke the approval from a Proposal.
```bash
  revoke(uint256 projectId)
```
- projectId - The id of the project allocated when user submitted the proposal for project.

### 4. To deploy the contract for the user
When the user gets enough approvals from admins, one of the admin will then deploy the dedicated contract (userCampaign contract) for the user, which represents their project, and contains their project information. This contract allows the user to add logs of their activity and get funding.
In this function the current carbon emissions are recorded which are fetched via CHAINLINK FUNCTIONS consumer contract.
```bash
  deployProject(uint256 projectId)
```
- projectId - The id of the project allocated when user submitted the proposal for project.

### 5. To give timely review for project
Once the user's proposal for project gets accepted and the dedicated contract is deployed, the admins will then review their work regulary after certain set interval.
Review involves checking the current emission feeds with the previous feeds, and if their is any improvement in the situation then the user is rewarded with 'Carbon Coin' ERC20 tokens.
The previous emission feeds are replaced by new emission feeds.
```bash
  reviewProject(uint256 projectId)
```
- projectId - The id of the project allocated when user submitted the proposal for project.

### 6. To get the information of all deployed projects
```bash
  getApprovedProjects()
```
It allows to view all the approved projects, and their related information.

### 7. To get the information of all projects which are not deployed
```bash
  getNotApprovedProjects()
```
It allows the admins to view proposals which are not yet deployed or approved by minimum set admins.

### 8. To get project information by project id
```bash
  getProjectAt(uint256 projectId)
```
- projectId - The id of the project allocated when user submitted the proposal for project.

‎ 
## User Campaign Contract
This contract is dedicated for the project of user.
Once the user proposal is verified on the marketplace contract, the admins will then deploy this userCampaign contract for the user's project.
It allows the project owner to upload logs, receive fundings.

### 1. addLogs(string memory caption, string memory location)
This function allows the owner of project to upload logs regulary for their project. It gets the current weather information via chainlink functions consumer contract, and adds to log.
```bash
  addLogs(string memory caption, string memory location)
```
- caption - Any comment for the log
- location - The location for which the log is added

### 2. Donate to Campaign
```bash
  donateToCampaign()
```
It allows the owner of project to receive fundings in ETH from people.


### 3. Withdrawal of funding
```bash
  withdraw()
```
It allows the owner of project to withdraw fundings received in userCampaign contract to their address provided during submission of the proposal to CarbonMarketplace contract.