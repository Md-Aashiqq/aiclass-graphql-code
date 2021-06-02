import { ApolloServer, gql, PubSub, withFilter } from "apollo-server";
let emotions = [];
// Schema definition

// Schema definition
const typeDefs = gql`
  type EmotionData {
    id: String
    type: String
  }

  # Queries can fetch a list of libraries
  type Query {
    getEmotions: [EmotionData]
  }

  type Mutation {
    addEmotion(id: String!, type: String!): [EmotionData]
  }

  type Subscription {
    newEmotion: [EmotionData]
  }
`;

const pubSub = new PubSub();
const NEW_EMOTION = "NEW_EMOTION";
const resolvers = {
  Query: {
    getEmotions(_, args) {
      return emotions;
    },
  },
  Mutation: {
    addEmotion(_, args) {
      emotions = emotions.filter((val) => val.id !== args.id);

      let temp = {
        id: args.id,
        type: args.type,
      };
      emotions.push(temp);
      pubSub.publish(NEW_EMOTION, { newEmotion: emotions });
      return emotions;
    },
  },
  Subscription: {
    newEmotion: {
      subscribe: () => pubSub.asyncIterator([NEW_EMOTION]),
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers, tracing: true });

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`server running in ${url}`);
});
