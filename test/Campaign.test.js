const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())

const compiledFactory = require('../ethereum/build/CampaignFactory.json')
const compiledCampaign = require('../ethereum/build/Campaign.json')

let accounts
let factory
let campaignAddress
let campaign

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' });

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000'
    });
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    )
})

describe('Campaigns', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address)
        assert.ok(campaign.options.address)
    });

    it('marks caller as the campaign manager', async () => {
        campaignManager = await campaign.methods.manager().call()
        assert.equal(campaignManager, accounts[0])
    })

    it('allows people to contribute money and marks them as approvers', async () =>{
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: '200'
        });
        const contributorApproval = await campaign.methods.approvers(accounts[1]).call();
        const approversCount = await campaign.methods.approversCount().call();
        assert.equal(contributorApproval, true)
        assert.equal(approversCount, 1)
    })

    it('requires a minimum amount to contribute', async () => {
        let executed;
        try {
          await campaign.methods.contribute().send({
            from: accounts[1],
            value: '99'
          });
          executed = 'success';
        } catch (err) {
          executed = 'fail'
        }
        assert.equal('fail', executed);
    });

    it('allows a manager to create a payment request', async () => {
        const requestDescription = 'this is my request description'
        const requestValue = '200'
        const requestRecipient = accounts[1]
        await campaign.methods.createRequest(requestDescription, requestValue, requestRecipient).send({
            from: accounts[0],
            gas: '1000000'
        })
        const { description, value, recipient, complete, approvalCount } = await campaign.methods.requests(0).call();
        assert.equal(description, requestDescription)
        assert.equal(value, requestValue)
        assert.equal(recipient, requestRecipient)
        assert.equal(complete, false)
        assert.equal(approvalCount, '0')
    });

    it('allows to contribute to a campaign and then to create, approve and finalize a request', async () => {
        const requestDescription = 'this is my request description'
        const requestValue = '100'
        const requestRecipient = accounts[3]
        const initialRecipientBalance = await web3.eth.getBalance(requestRecipient) // in wei, and it's a string
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: '200'
        });
        await campaign.methods.contribute().send({
            from: accounts[2],
            value: '500'
        });
        // /!\ I should not create a request with a value > total amount of contributions.
        // It will not trigger an error but when I finalize the request if 
        // requestValue > total amount of contributions then the transfer will fail
        await campaign.methods.createRequest(requestDescription, requestValue, requestRecipient).send({
            from: accounts[0],
            gas: '1000000'
        })
        await campaign.methods.approveRequest(0).send({
            from: accounts[1],
            gas: '1000000'
        })
        await campaign.methods.approveRequest(0).send({
            from: accounts[2],
            gas: '1000000'
        })
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        })
        const finalRecipientBalance = await web3.eth.getBalance(requestRecipient)
        assert.equal(Number(finalRecipientBalance), Number(initialRecipientBalance) + Number(requestValue))
    })
})
