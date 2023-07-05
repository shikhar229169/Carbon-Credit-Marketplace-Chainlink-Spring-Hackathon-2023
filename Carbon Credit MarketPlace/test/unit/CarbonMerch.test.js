const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const { localNetworks } = require("../../helper-hardhat-config.js")
const { assert, expect } = require("chai")

!localNetworks.includes(network.name)
    ? describe.skip
    : describe("Carbon Merch Testing", () => {
        let deployer
        let user
        let carbonMerch
        let userCarbonMerch

        let carbonMarketplace
        let carbonMarketplace2
        let userCarbonMarketplace

        let emissionFeeds

        const name = "Cat Bulb"
        const desc = "Cute Cat Bulb"
        const qty = 4
        const cost = 2
        const imageURI = `ipfs://QmXyUEL3qaqvPyb5UKCYYska7n9wp8zREcw5mjCzSHaBf4`
        const category = 0

        const name2 = "Lotus Seeds"
        const desc2 = "These seeds are of lotus plant"
        const qty2 = 5
        const cost2 = 4
        const imageURI2 = `ipfs://QmUQGNXrGxhmNbX83u74biui3tkDcVUxfk3eFa3QVChtr6`
        const category2 = 4 

        beforeEach(async() => {
            await deployments.fixture(["all"])
            deployer = (await getNamedAccounts()).deployer
            carbonMerch = await ethers.getContract("CarbonMerch", deployer)
            carbonMarketplace = await ethers.getContract("CarbonMarketplace", deployer)
            emissionFeeds = await ethers.getContract("mockEmissionFeeds", deployer)

            const accounts = await ethers.getSigners()
            const admin2 = accounts[1]

            carbonMarketplace2 = carbonMarketplace.connect(admin2)

            user = accounts[4].address
            userCarbonMerch = carbonMerch.connect(accounts[4])
            userCarbonMarketplace = carbonMarketplace.connect(accounts[4])
        })

        describe("Constructor Testing", () => {
            it("Carbon Marketplace address set up correctly", async() => {
                const actualAddress = await carbonMerch.getCarbonMarketplace()
                assert.equal(actualAddress, carbonMarketplace.address)
            })
        })

        describe("Add Product Testing", () => {
            it("Reverts if caller is not admin", async() => {
                const accounts = await ethers.getSigners()
                const attacker = await carbonMerch.connect(accounts[5])

                await expect(attacker.addProduct(name, desc, qty, cost, imageURI, category))
                    .to.be.revertedWith("CarbonMerch__notAdmin")
            })

            it("Allows admin to add product", async() => {
                const response = await carbonMerch.addProduct(name, desc, qty, cost, imageURI, category)
                await response.wait(1)

                const product = await carbonMerch.getProductAtIdx(0)

                assert.equal(product.name, name)
                assert.equal(product.description, desc)
                assert.equal(product.qty, qty)
                assert.equal(product.cost, cost)
                assert.equal(product.imageURI, imageURI)
                assert.equal(product.category, category)
            })
        })

        describe("Add Quantity Testing", () => {
            beforeEach(async() => {
                const response = await carbonMerch.addProduct(name, desc, qty, cost, imageURI, category)
                await response.wait(1)
            })

            it("Reverts if caller is not admin", async() => {
                const accounts = await ethers.getSigners()
                const attacker = await carbonMerch.connect(accounts[5])

                const productId = 0
                const incQty = 5

                await expect(attacker.addQty(productId, incQty))
                    .to.be.revertedWith("CarbonMerch__notAdmin")
            })

            it("Reverts if zero quantity is added", async() => {
                await expect(carbonMerch.addQty(0, 0)).to.be.revertedWith("CarbonMerch__zeroQty")
            })

            it("Add quantity works fine", async() => {
                const increaseQuantity = 5;

                const productId = 0
                const initQty = (await carbonMerch.getProductAtIdx(productId)).qty

                const addProductResponse = await carbonMerch.addQty(productId, increaseQuantity)
                await addProductResponse.wait(1)

                const finalQty = (await carbonMerch.getProductAtIdx(productId)).qty

                assert.equal(finalQty.toString(), initQty.add(increaseQuantity).toString())
            })
        })

        describe("Buy Product Testing", async() => {
            let orderProductIdx
            let orderProductQty
            
            let orderProductIdx2
            let orderProductQty2

            let residentialAddress

            let bill

            beforeEach(async() => {
                const projectName = "G20 Agra"
                const projectLink = "G20Agra.agra-gov.in"
                const pinCode = "282005"
                const countryCode = "IN"

                const projectId = await carbonMarketplace.totalProjects()

                const submitProposalResponse = await userCarbonMarketplace.submitProposal(
                    projectName, projectLink, pinCode, countryCode
                )
                await submitProposalResponse.wait(1)

                const approvalResponse1 = await carbonMarketplace.giveApproval(projectId)
                await approvalResponse1.wait(1)

                const approvalResponse2 = await carbonMarketplace2.giveApproval(projectId)
                await approvalResponse2.wait(1)

                const deployProjectResponse = await carbonMarketplace.deployProject(projectId)
                await deployProjectResponse.wait(1)

                // fake that the emission feeds are reduced, lets reduce them to zero
                const setEmissionFeedsResponse = await emissionFeeds.setResponse(0, 0, 0, 0, 0)
                await setEmissionFeedsResponse.wait(1)

                // Admin will review the project
                const reviewInterval = await carbonMarketplace.reviewInterval()
                await ethers.provider.send("evm_increaseTime", [reviewInterval.toNumber() + 1])
                await ethers.provider.send("evm_mine", [])

                const reviewResponse = await carbonMarketplace.reviewProject(projectId)
                await reviewResponse.wait(1)


                const response1 = await carbonMerch.addProduct(name, desc, qty, cost, imageURI, category)
                await response1.wait(1)

                const response2 = await carbonMerch.addProduct(name2, desc2, qty2, cost2, imageURI2, category2)
                await response2.wait(1)

                orderProductIdx = [0, 1]
                orderProductQty = [qty, qty2]
                orderProductIdx2 = [1, 5]
                orderProductQty2 = [qty + 1, qty2]
                residentialAddress = "Decentralized Nagar"

                bill = (cost * qty) + (cost2 * qty2)
            })

            it("Reverts if no product is ordered", async() => {
                await expect(userCarbonMerch.buyProduct([], [], "Meow Nagar")).to.be.revertedWith("CarbonMerch__buyAtLeastOneProduct");
            })

            it("Reverts if the quantity exceeds buy limit", async() => {
                await expect(userCarbonMerch.buyProduct(orderProductIdx, orderProductQty2, residentialAddress))
                    .to.be.revertedWith("CarbonMerch__qtyError")
            })

            it("Reverts if the product doesn't exist", async() => {
                await expect(userCarbonMerch.buyProduct(orderProductIdx2, orderProductQty, residentialAddress))
                    .to.be.revertedWith("CarbonMerch__invalidProductId")
            })

            it("Allows to buy product if order request correctly", async() => {
                const initBalance = await carbonMarketplace.balanceOf(user)
                const orderId = 0
                
                const approveResponse = await userCarbonMarketplace.approve(carbonMerch.address, bill)
                await approveResponse.wait(1)
                
                const orderResponse = await userCarbonMerch.buyProduct(orderProductIdx, orderProductQty, residentialAddress)
                const receipt = await orderResponse.wait(1)

                const order = await userCarbonMerch.trackOrder(orderId)

                const finalBalance = await carbonMarketplace.balanceOf(user)
                const event = receipt.events[2].args

                const actualQty1 = (await carbonMerch.getProductAtIdx(0)).qty 
                const actualQty2 = (await carbonMerch.getProductAtIdx(1)).qty
                
                assert.equal(actualQty1.toString(), (qty - orderProductQty[0]).toString())
                assert.equal(actualQty2.toString(), (qty2 - orderProductQty[1]).toString())
                assert.equal(user, event.consumer)
                assert.equal(bill.toString(), event.bill.toString())
                assert.equal(event.orderId.toString(), orderId.toString())
                assert.equal(finalBalance.toString(), initBalance.sub(bill).toString())
                assert.equal(order.consumer, user)
                assert.equal(order.orderId, orderId)
                assert.equal(order.residentialAddress, residentialAddress)
                assert.equal(order.status, 0)          // 0 -> booked
            })
        })
    })