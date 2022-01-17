import React, { useEffect } from 'react'
import factory from '../ethereum/factory'
import { Button, Card } from 'semantic-ui-react'
import { Link } from "../routes";

export default ({campaigns}) => {
    const renderCampaigns = () => {
      const items = campaigns.map(address => {
        return {
          header: address,
          description: (
            <Link route={`/campaigns/${address}`}>
              <a>View Campaign</a>
            </Link>
          ),
          fluid: true
        }
      })
      return <Card.Group items={items} />
    } 
  
    return (
      <div>
          <h3>Open Campaigns</h3>
          <Link route="/campaigns/new">
            <a>
              <Button
                floated="right"
                content="Create Campaign"
                icon="add circle"
                primary
              />
            </a>
          </Link>
          {renderCampaigns()}
      </div>
    )
}

export async function getServerSideProps() {
    const campaigns = await factory.methods.getDeployedCampaigns().call()
    return {
      props: {
          campaigns
      },
    }
  }
  