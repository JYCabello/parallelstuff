import { createClient, gql } from "@urql/core";
import 'isomorphic-unfetch';
const url = 'https://gehsfvet46.execute-api.us-east-1.amazonaws.com/production/graphql';
const client = createClient({ url });

const listInventories = gql`
query {
    ListStockReadModels{
        items {
            id
            amount
        }
    }
}
`;

const receive = gql`
mutation {
    ReceiveStock(
      input: {
        amount: 12
        productId: "fee75879-9150-4992-a51e-daca256aa9e6"
      }
    )
}
`

const reserve = gql`
mutation {
    ReserveStock(
      input: {
        amount: 4
        productId: "fee75879-9150-4992-a51e-daca256aa9e6"
      }
    )
}
`;
async function hitIt() {
    client.mutation(receive, {}).toPromise().then(async () => {
        await Promise.allSettled(
            [
                client.mutation(reserve, {}).toPromise(),
                client.mutation(reserve, {}).toPromise(),
                client.mutation(reserve, {}).toPromise(),
                client.mutation(reserve, {}).toPromise()
            ]
        )
    })
}
function delay(miliseconds: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, miliseconds);
    });
}


async function doStockStuff() {
  await Promise
    .allSettled([...Array(1)].map(x => hitIt()))
    .then(async () => {
        // await delay(5000)
        // const r = await client
        //     .query(listInventories, {})
        //     .toPromise();
        // return console.log(r.data.ListInventories.items);
    });
}

const addamount = gql`
mutation add10 {
    Add(input: { amount: 4, additionId: "fee75879-9150-4992-a51e-daca256aa9e6" })
}
`;

const getaddition = gql`
query {
  ListAdditionReadModels {
    items {
      id
      amount
    }
    count
  }
}
`;

async function showAdditions() {
  const queryClient = createClient({ url });
  const preQueryResult = await queryClient.query(getaddition, {}).toPromise();
  if (preQueryResult.data?.ListAdditionReadModels.items) {
    return preQueryResult.data.ListAdditionReadModels.items[0]?.amount as number || 0;
  }
  return 0;
}

async function addStuff() {
  const amounts = 25;
  const pre = await showAdditions();
  console.log(`We had %d before`, pre);
  const results = await Promise
    .all([...Array(amounts)]
      .map(async () => {
        const result = 
          await client
            .mutation(
              addamount,
              { }
            ).toPromise();
        return result.data;
      })
    );
  
  console.log("Sent all mutations, total of successes:");
  console.log(results.filter(r => r?.Add).length);
  results.filter(r => !r?.Add).forEach(console.log);
  await delay(1500);

  const after = await showAdditions();
  console.log(`We have %d after`, after);
  console.log(`Difference %d, expected %d`, after - pre, amounts);
}

addStuff();
