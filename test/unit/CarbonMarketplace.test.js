const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const { networkConfig, localNetworks } = require("../../helper-hardhat-config.js")
const { assert, expect } = require("chai")

!localNetworks.includes(network.name)
    ? describe.skip
    : describe("Carbon Marketplace Testing", () => {
        const chainId = network.config.chainId
        let carbon
        let carbon2
        let userCarbon
        let deployer
        let admin2
        let user
        let constructorData = networkConfig[chainId]
        let emissionFeeds
        let weatherFeeds

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

            emissionFeeds = await ethers.getContract("mockEmissionFeeds")
            weatherFeeds = await ethers.getContract("mockWeatherFeeds")
        })

        describe("Constructor Testing", () => [
            it("Passes if every args is correctly passed", async () => {
                const admins = []
                for (let i = 0; i < 2; i++) {
                    const curr = await carbon.admins(i)
                    admins.push(curr)
                }

                const approvalsRequired = await carbon.approvalsRequired()
                const emissionFeedsAddress = await carbon.emissionFeeds()
                const weatherFeedsAddress = await carbon.weatherFeeds()
                const reviewInterval = await carbon.reviewInterval()

                const reqAdmin = [deployer, admin2.address]

                assert.equal(admins[0], reqAdmin[0])
                assert.equal(admins[1], reqAdmin[1])
                assert.equal(approvalsRequired, constructorData.approvalsRequired)
                assert.equal(emissionFeedsAddress, emissionFeeds.address)
                assert.equal(weatherFeedsAddress, weatherFeeds.address)
                assert.equal(reviewInterval, constructorData.reviewInterval)
            }),
        ])

        describe("submitProposal Testing", () => {
            it("checking in submitProposal work", async () => {
                let previousProject = await userCarbon.totalProjects()

                const response = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )
                await response.wait(1)

                const data = await userCarbon.getProjectAt(previousProject)
                let currProject = await userCarbon.totalProjects()

                assert.equal(currProject.toString(), previousProject.add(1).toString())
                assert.equal(user.address, data.author)
                assert.equal(projectName, data.projectName)
                assert.equal(projectLink, data.projectLink)
                assert.equal(pinCode + "," + countryCode, data.zipCode)
            })
        })

        describe("giveApproval Testing", () => {
            it("Fails if caller is not in admins list", async() => {
                let projectId = await carbon.totalProjects()

                const submit = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )

                await submit.wait(1)
                
                const accounts = await ethers.getSigners()
                const attackerWallet = accounts[3]

                const attackerInstance = await carbon.connect(attackerWallet)

                await expect(attackerInstance.giveApproval(projectId)).to.be.revertedWith("CarbonMarketplace__notAdmin")
            })

            it("Checking giveApproval work", async () => {
                let projectId = await carbon.totalProjects()

                const submit = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )
                await submit.wait(1)

                const previousApprovals = (await carbon.getProjectAt(projectId)).approvals

                const response = await carbon.giveApproval(projectId)
                await response.wait(1)

                const currApproved = await carbon.approved(projectId, deployer)
                const currApprovals = (await carbon.getProjectAt(projectId)).approvals

                assert.equal(currApproved, true)
                assert.equal(
                    previousApprovals.add(1).toString(),
                    currApprovals.toString()
                )
            })
        })

        describe("revoke Testing", () => {
            it("Fails if the admin not yet approved Proposal", async() => {
                let projectId = await carbon.totalProjects()

                const submit = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )
                await submit.wait(1)

                await (expect(carbon.revoke(projectId))).to.be.revertedWith("CarbonMarketplace__alreadyNotApproved")
            })

            it("Fails if caller is not in admins list", async() => {
                let projectId = await carbon.totalProjects()

                const submit = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )

                await submit.wait(1)
                
                const accounts = await ethers.getSigners()
                const attackerWallet = accounts[3]

                const attackerInstance = await carbon.connect(attackerWallet)

                await expect(attackerInstance.revoke(projectId)).to.be.revertedWith("CarbonMarketplace__notAdmin")
            })

            it("Checking the revoke", async () => {
                let projectId = await carbon.totalProjects()

                const submit = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )
                await submit.wait(1)

                const approvingProject = await carbon.giveApproval(projectId)
                await approvingProject.wait(1)

                let approvedIndicator = false

                const previousApprovals = await carbon.getProjectAt(projectId)
                const response = await carbon.revoke(projectId)
                await response.wait(1)

                const currApproved = await carbon.approved(projectId, deployer)
                const currApprovals = await carbon.getProjectAt(projectId)

                assert.equal(approvedIndicator, currApproved)
                assert.equal(
                    previousApprovals.approvals.toString(),
                    currApprovals.approvals.add(1).toString()
                )
            })
        })

        describe("deployProject Testing", () => {
            it("Reverts if caller is not in admins list", async() => {
                let projectId = await carbon.totalProjects()

                const submit = await userCarbon.submitProposal(
                    projectName, projectLink, pinCode, countryCode
                )

                await submit.wait(1)

                const accounts = await ethers.getSigners()
                const attackerInstance = await carbon.connect(accounts[3])

                await expect(attackerInstance.deployProject(projectId)).to.be.revertedWith("CarbonMarketplace__notAdmin")
            })

            it("Reverts if the proposal has less approvals", async() => {
                let projectId = await carbon.totalProjects()

                const submit = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )
                await submit.wait(1)

                await expect(carbon.deployProject(projectId)).to.be.revertedWith("CarbonMarketplace__notEnoughApprovals")
            })

            it("checking the deployProject", async () => {
                let projectId = await carbon.totalProjects()

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

                const authProjectAccepted = true
                const prevAcceptedProjects = await carbon.acceptedProjects()

                const deployingProject = await carbon.deployProject(projectId)
                await deployingProject.wait(1)

                const currAuthProject = await carbon.projects(projectId)
                const currAcceptedProjects = await carbon.acceptedProjects()

                assert.equal(authProjectAccepted, currAuthProject.accepted)
                assert.equal(prevAcceptedProjects.add(1).toString(), currAcceptedProjects.toString())
                assert.notEqual(currAuthProject.authorCampaignContract, "0x0000000000000000000000000000000000000000")

                const reqEmissionFeedsBytes = await emissionFeeds.latestResponse()
                const reqEmissionFeeds = ethers.utils.defaultAbiCoder.decode(['int256','int256','int256','int256','int256'], reqEmissionFeedsBytes);

                assert.equal(currAuthProject.latestEmissionFeeds.CO.toString(), reqEmissionFeeds[0].toString())
                assert.equal(currAuthProject.latestEmissionFeeds.NO2.toString(), reqEmissionFeeds[1].toString())
                assert.equal(currAuthProject.latestEmissionFeeds.SO2.toString(), reqEmissionFeeds[2].toString())
                assert.equal(currAuthProject.latestEmissionFeeds.PM2_5.toString(), reqEmissionFeeds[3].toString())
                assert.equal(currAuthProject.latestEmissionFeeds.PM10.toString(), reqEmissionFeeds[4].toString())
            })
        })

        describe("reviewProject Testing", () => {
            it("Reverts if the review interval is not passed", async () => {
                const submit = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )
                await submit.wait(1)

                let projectId = 0

                const approvingProject = await carbon.giveApproval(projectId)
                await approvingProject.wait(1)

                const approvingProject2 = await carbon2.giveApproval(projectId)
                await approvingProject2.wait(1)

                const deployingProject = await carbon.deployProject(projectId)
                await deployingProject.wait(1)

                await expect(carbon.reviewProject(projectId)).to.be.revertedWith("CarbonMarketplace__reviewNotRequired")
            })

            it("Project is reviewed, tokens are awarded, and emission feeds updated", async() => {
                const submit = await userCarbon.submitProposal(
                    projectName,
                    projectLink,
                    pinCode,
                    countryCode
                )
                await submit.wait(1)

                let projectId = 0

                const approvingProject = await carbon.giveApproval(projectId)
                await approvingProject.wait(1)

                const approvingProject2 = await carbon2.giveApproval(projectId)
                await approvingProject2.wait(1)

                const deployingProject = await carbon.deployProject(projectId)
                await deployingProject.wait(1)

                // increase the time, to pass review interval
                const reviewInterval = await carbon.reviewInterval()
                await ethers.provider.send("evm_increaseTime", [reviewInterval.toNumber() + 1])
                await ethers.provider.send("evm_mine", [])

                // Manipulate the emissionFeeds data
                emissionFeeds.setResponse("0", "0", "0", "0", "0")

                const prevBalance = await carbon.balanceOf(user.address)

                const reviewResponse = await carbon.reviewProject(projectId)
                await reviewResponse.wait(1)

                const currBalance = await carbon.balanceOf(user.address)
                const requiredTokenIncrease = ethers.utils.parseEther("50")

                const currAuthProject = await carbon.getProjectAt(projectId)

                const reqEmissionFeedsBytes = await emissionFeeds.latestResponse()
                const reqEmissionFeeds = ethers.utils.defaultAbiCoder.decode(['int256','int256','int256','int256','int256'], reqEmissionFeedsBytes);

                assert.equal(currBalance.toString(), prevBalance.add(requiredTokenIncrease).toString())

                assert.equal(currAuthProject.latestEmissionFeeds.CO.toString(), reqEmissionFeeds[0].toString())
                assert.equal(currAuthProject.latestEmissionFeeds.NO2.toString(), reqEmissionFeeds[1].toString())
                assert.equal(currAuthProject.latestEmissionFeeds.SO2.toString(), reqEmissionFeeds[2].toString())
                assert.equal(currAuthProject.latestEmissionFeeds.PM2_5.toString(), reqEmissionFeeds[3].toString())
                assert.equal(currAuthProject.latestEmissionFeeds.PM10.toString(), reqEmissionFeeds[4].toString())
            })
        })
    })