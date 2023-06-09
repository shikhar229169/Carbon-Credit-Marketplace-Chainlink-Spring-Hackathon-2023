# Carbon Marketplace
This project aims to help reduce carbon emissions and to tackle from climate change, which includes users to submit their Proposals regarding preventions from climate change. The people who wants to come forward and take initiative towards contributing to prevention of climate change can submit their proposal to the Carbon Marketplace contract. The admins of the carbon marketplace contract will then verify the authencity of the user and when the proposal is verified, a dedicated user campaign contract is deployed for the person who submitted the proposal where they can get funding for their project, add their daily logs. At fixed intervals the admins of the market place contract can run the regular review for projects and can check the current emission feeds with the previous feeds and if their is improvements they will reward ERC20 Carbon Coin tokens. It uses chainlink functions to get the carbon emission feeds and weather feeds. There is an already deployed automated consumer contract which fetches these feeds.

# Chainlink Functions Work
The Automated Contracts are deployed on the polygon network:
Deployed Automated Consumer Contract at address on Polygon Mumbai Network:
```bash
  emissionFeeds: 0x12D48b7Fa83dCF26b91591A63349048173c6a288
  weatherFeeds:  0x60e55982f7DF115D58eae49E631eE2FdC8aB0Ef6
```

- Emission Feeds is used to fetch the carbon emissions including the amount of co, no2, so2, pm2_5, pm10 via open-weather API key.

- Weather Feeds is used to fetch the weather info via open-weather API key.

## The documentation for Carbon Marketplace is in the respective folder in its README.md