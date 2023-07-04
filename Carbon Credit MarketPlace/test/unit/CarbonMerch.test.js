const { ethers, network, deployments, getNamedAccounts } = require("hardhat")
const { localNetworks } = require("../../helper-hardhat-config.js")
const { assert, expect } = require("chai")

!localNetworks.includes(network.name)
    ? describe.skip
    : describe("Carbon Merch Testing", () => {
        let deployer
        let carbonMerch
        let carbonMarketplace

        const name = "Cat Bulb"
        const desc = "Cute Cat Bulb"
        const qty = 4
        const cost = 80
        const imageURI = `ipfs://QmXyUEL3qaqvPyb5UKCYYska7n9wp8zREcw5mjCzSHaBf4`
        const category = 0

        beforeEach(async() => {
            // await deployments.fixture(["all"])
            deployer = (await getNamedAccounts()).deployer
            carbonMerch = await ethers.getContract("CarbonMerch", deployer)
            carbonMarketplace = await ethers.getContract("CarbonMarketplace", deployer)
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
            it("Add quantity works fine", async() => {
                const response = await carbonMerch.addProduct(name, desc, qty, cost, imageURI, category)
                await response.wait(1)

                const increaseQuantity = 5;

                const initQty = (await carbonMerch.getProductAtIdx(0)).qty

                const addProductResponse = await carbonMerch.addQty(0, increaseQuantity)
                await addProductResponse.wait(1)

                const finalQty = (await carbonMerch.getProductAtIdx(0)).qty

                assert.equal(finalQty.toString(), initQty.add(increaseQuantity).toString())
            })
        })
    })