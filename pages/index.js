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
        <link
            async
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css"
          />
        {renderCampaigns()}
        <Button content="Create campaign" icon="add circle" primary />
      </div>
    )
}

export async function getServerSideProps(context) {
    const campaigns = await factory.methods.getDeployedCampaigns().call()
    return {
      props: {
          campaigns
      },
    }
  }
  