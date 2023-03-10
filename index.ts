import { createClient, gql } from "@urql/core";
import 'isomorphic-unfetch';

const client = createClient({
    url: 'http://localhost:8080/graphql',
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
function delay (miliseconds: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, miliseconds);
    });
}



Promise.allSettled([...Array(15).keys()].map(x => hitIt()))
.then(async () => {
    // await delay(5000)
    // const r = await client
    //     .query(listInventories, {})
    //     .toPromise();
    // return console.log(r.data.ListInventories.items);
})

