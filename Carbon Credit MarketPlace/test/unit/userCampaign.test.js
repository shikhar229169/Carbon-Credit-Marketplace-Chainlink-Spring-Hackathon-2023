const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const { localNetworks } = require("../../helper-hardhat-config.js")
const { assert, expect, use } = require("chai")

!localNetworks.includes(network.name)
    ? describe.skip
    : describe("User Campaign Testing", () => {
        const chainId = network.config.chainId
        let carbon
        let carbon2
        let userCarbon
        let userCampaign
        let deployer
        let admin2
        let user
        let weatherFeeds

        let projectId

        let projectName = "Nature builder"
        let projectLink = "Link.."
        let pinCode = "282005"
        let countryCode = "IN"

        beforeEach(async () => {
            const accounts = await ethers.getSigners()
            deployer = (await getNamedAccounts()).deployer
            admin2 = accounts[1]
            user = accounts[2]

            await deployments.fixture(["all"])

            carbon = await ethers.getContract("CarbonMarketplace", deployer)
            carbon2 = carbon.connect(admin2)
            userCarbon = carbon.connect(user)

            weatherFeeds = await ethers.getContract("mockWeatherFeeds")

            projectId = await carbon.totalProjects()

            const submit = await userCarbon.submitProposal(
                projectName,
                projectLink,
                pinCode,
                countryCode
            )
            await submit.wait(1)


            const approvingProject = await carbon.giveApproval(projectId)
            await approvingProject.wait(1)

            const approvingProject2 = await carbon2.giveApproval(projectId)
            await approvingProject2.wait(1)

            const deployingProject = await carbon.deployProject(projectId)
            await deployingProject.wait(1)

            const userCampaignAddress = (await carbon.getProjectAt(projectId)).authorCampaignContract
            userCampaign = await ethers.getContractAt("UserCampaign", userCampaignAddress, user)

            // increase the time, to pass review interval
            await ethers.provider.send("evm_increaseTime", [604801])
            await ethers.provider.send("evm_mine", [])
        })

        describe("Constructor Testing", () => {
            it("Values are set perfectly", async() => {
                const reqProjectId = await userCampaign.projectID()
                const reqProjectName = await userCampaign.projectName()
                const author = await userCampaign.owner()
                const reqWeatherFeeds = await userCampaign.weatherFeeds()

                assert.equal(projectId.toString(), reqProjectId.toString())
                assert.equal(projectName, reqProjectName)
                assert.equal(user.address, author)
                assert.equal(weatherFeeds.address, reqWeatherFeeds)
            })
        })

        describe("addLogs function testing", () => {
            it("Reverts if caller is not owner", async() => {
                const accounts = await ethers.getSigners()
                const attackerInstance = await userCampaign.connect(accounts[3])
                await expect(attackerInstance.addLogs("I AM SCAMMER", "HACKER-NAGAR")).to.be.revertedWith("UserCampaign__notOwner")
            })

            it("Allows the owner to add logs", async() => {
                const caption = "Cleaned the Agra Fort"
                const location = "Rakabganj"
                const txnResponse = await userCampaign.addLogs(caption, location)
                await txnResponse.wait(1)

                const currLog = await userCampaign.logs(0)
                
                assert.equal(caption, currLog.caption)
                assert.equal(location, currLog.location)
            })
        })

        describe("Donate to campaign Testing", () => {
            it("Reverts if owner tries to donate", async() => {
                await expect(userCampaign.donateToCampaign({ value: 1 })).to.be.revertedWith("UserCampaign__ownerCantSendETH")
            })

            it("Donations are received in contract", async() => {
                const donator = (await ethers.getSigners())[4]
                const donatorInstance = await userCampaign.connect(donator)
                const amount = ethers.utils.parseEther("1")
                const txnResponse = await donatorInstance.donateToCampaign({value: amount})
                await txnResponse.wait(1)

                assert.equal(amount, (await ethers.provider.getBalance(userCampaign.address)).toString())
            })
        })
        
        describe("Withdraw function testing", () => {
            it("Allows owner to withdrae funds", async() => {
                const donator = (await ethers.getSigners())[4]
                const donatorInstance = await userCampaign.connect(donator)
                const amount = ethers.utils.parseEther("1")
                const txnResponse = await donatorInstance.donateToCampaign({value: amount})
                await txnResponse.wait(1)

                const initialOwnerBalance = await ethers.provider.getBalance(user.address)
                const initialContractBalance = await ethers.provider.getBalance(userCampaign.address)

                const withdrawResponse = await userCampaign.withdraw()
                const withdrawReceipt = await withdrawResponse.wait(1)

                const finalOwnerBalance = await ethers.provider.getBalance(user.address)
                const finalContractBalance = await ethers.provider.getBalance(userCampaign.address)

                const { effectiveGasPrice, gasUsed } = withdrawReceipt
                const netGasUsed = effectiveGasPrice.mul(gasUsed)

                assert.equal(finalContractBalance.toString(), "0")
                assert.equal(finalOwnerBalance.toString(), initialOwnerBalance.add(initialContractBalance).sub(netGasUsed).toString())
            })

            it("Reverts if caller is not owner", async() => {
                const donator = (await ethers.getSigners())[4]
                const donatorInstance = await userCampaign.connect(donator)
                const amount = ethers.utils.parseEther("1")
                const txnResponse = await donatorInstance.donateToCampaign({value: amount})
                await txnResponse.wait(1)

                const accounts = await ethers.getSigners()
                const attackerInstance = await userCampaign.connect(accounts[3])

                await expect(attackerInstance.withdraw()).to.be.revertedWith("UserCampaign__notOwner")
            })
        })
    })