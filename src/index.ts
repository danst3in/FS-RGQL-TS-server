import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  // connect to db
  const orm = await MikroORM.init(mikroConfig);
  // run migrations here in code instead of cli
  await orm.getMigrator().up();
  // run sql commands
  //  create instance of post
  // const post = orm.em.create(Post, { title: "my first post" });
  // insert post into the database
  // await orm.em.persistAndFlush(post);

  // find all posts
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);

  const app = express();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
    // typeDefs,
    // resolvers,
    // context: (req) => ({
    //   db: spacex_launches_data,
    // }),
  });
  server.applyMiddleware({ app });

  const PORT = 4000;

  //*
  //* My boilerplate error-handler
  app.use((err, req, res, next) => {
    const defaultErr = {
      log: "Express error handler caught unknown middleware error",
      status: 400,
      message: { err: "An error occurred" },
    };
    const errorObj = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
  });

  // The `listen` method launches a web server.
  app.listen({ port: PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

main().catch((err) => console.error(err));
