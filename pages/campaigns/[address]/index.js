import React, { Component } from "react";
import { Card, Grid, Button } from "semantic-ui-react";
import Campaign from "../../../ethereum/campaign";
import web3 from "../../../ethereum/web3";
import ContributeForm from "../../../components/ContributeForm";
import { Link } from "../../../routes";

export default ({
    address,
    balance,
    manager,
    minimumContribution,
    requestsCount,
    approversCount,
}) => {

    const renderCards = () => {
        const items = [
        {
            header: manager,
            meta: "Address of Manager",
            description:
            "The manager created this campaign and can create requests to withdraw money",
            style: { overflowWrap: "break-word" },
        },
        {
            header: minimumContribution,
            meta: "Minimum Contribution (wei)",
            description:
            "You must contribute at least this much wei to become an approver",
        },
        {
            header: requestsCount,
            meta: "Number of Requests",
            description:
            "A request tries to withdraw money from the contract. Requests must be approved by approvers",
        },
        {
            header: approversCount,
            meta: "Number of Approvers",
            description:
            "Number of people who have already donated to this campaign",
        },
        {
            header: web3.utils.fromWei(balance, "ether"),
            meta: "Campaign Balance (ether)",
            description:
            "The balance is how much money this campaign has left to spend.",
        },
        ];

        return <Card.Group items={items} />;
    }

    return (
      <div>
        <h3>Campaign Show</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>{renderCards()}</Grid.Column>
            <Grid.Column width={6}>
              <ContributeForm address={address} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Link route={`/campaigns/${address}/requests`}>
                <a>
                  <Button primary>View Requests</Button>
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
}

export async function getServerSideProps({ query }) {
    const campaign = Campaign(query.address);

    const summary = await campaign.methods.getSummary().call();

    return {
        props: {
            address: query.address,
            minimumContribution: summary[0],
            balance: summary[1],
            requestsCount: summary[2],
            approversCount: summary[3],
            manager: summary[4],
        }
    };
}
