## Inspiration
This year we are facing the major issue that is climate change, it is having a bad impact on our mother Earth and glaciers are melting. Various tourist locations like Maldives are expected to become uninhabitable due to global warming in the coming decades, along with Kiribati island, Solomon island, etc.
So to overcome this problem we require a contribution from each and every person of  this world to come forward and provide their contributions in any way possible.

## What it does
Keeping the issue in mind we created a smart contract that allows people to register their proposal which aims to contribute to prevent climate change and get it submitted on carbonMarketplace contract, where the admins can verify the proposal, once its get verified the owner of project will start working towards it, add their logs of their contributions to their dedicated userCampaign contract.
It motivates people to participate in large numbers and rewards them on the basis of the reduction in emission levels. The reward is a Carbon Coin ERC20 token.

## How we built it
It is built via hardhat framework using solidity.
We used chainlink functions to get the emission feeds and weather feeds. The automated consumer contract for retrieving these feeds is already deployed, and the contracts can easily read the data from contract.
The data for emission feeds and weather feeds is fetched through open weather API.
The data on the consumer contract is refreshed via chainlink keepers every 2 hrs.
Hardhat framework is used which allows to write smart contracts, deploy them and test them.

## Challenges we ran into
There were few challenges we ran into:
- Integrating the chainlink functions in our project, first we made our carbonMarketplace contract as the consumer and also the userCampaign contract, but this makes our code much larger so as to keep it simple, we deployed  dedicated consumer contracts for emission feeds and weather feeds which will provide the data to our contracts.

## Accomplishments that we're proud of
- We learnt a bunch of new things.
- Took a step forward to solve a real life problem which is having a very bad impact, but with this project we can prevent it, motivate people to take initiative and register their projects which will provide help preventing climate change.
- Participated in our very first hackathon.

## What we learned
- We learnt problem solving skills, communication skills got enhanced as all the time team members were in touch while building the project.
- To use chainlink functions, ERC20 token standard.