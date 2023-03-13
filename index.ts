import { createClient, gql } from "@urql/core";
import 'isomorphic-unfetch';

const client = createClient({
    url: 'https://avya4kkcqc.execute-api.us-east-1.amazonaws.com/production/graphql',
  });

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

const add10 = gql`
mutation add10 {
    Add(input: { additionId: "fee75879-9150-4992-a51e-daca256aa9e6", amount: 1 })
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
  const preQueryResult = await client.query(getaddition, {}).toPromise();
  if (preQueryResult.data?.ListAdditionReadModels.items) {
    console.log(preQueryResult.data.ListAdditionReadModels.items[0].amount);
  }
}

async function addStuff() {
  await showAdditions();
  await Promise
    .allSettled([...Array(100)]
    .map(async () => {
      const result = await client.mutation(add10, {}).toPromise();
      if (!(result.data.Add)) {
        console.log("One mutation failed");
      }
    }));
  console.log("sent all mutations");
  await delay(10_000);
  await showAdditions();
}

addStuff();
