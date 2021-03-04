import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import mikroConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__ } from "./constants";
import { MyContext } from "./types";

const main = async () => {
  // connect to db
  const orm = await MikroORM.init(mikroConfig);
  // run migrations here in code instead of cli
  await orm.getMigrator().up();

  const app = express();

  let RedisStore = connectRedis(session);
  let redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 1, // 1 year
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "surfsup_dawg",
      resave: false,
    })
  );
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      em: orm.em,
      req,
      res,
    }),
  });
  apolloServer.applyMiddleware({ app });

  const PORT = 4000;

  // //*
  // //* My boilerplate error-handler
  // app.use((err, req, res, next) => {
  //   const defaultErr = {
  //     log: "Express error handler caught unknown middleware error",
  //     status: 400,
  //     message: { err: "An error occurred" },
  //   };
  //   const errorObj = Object.assign({}, defaultErr, err);
  //   console.log(errorObj.log);
  //   return res.status(errorObj.status).json(errorObj.message);
  // });

  // The `listen` method launches a web server.
  app.listen({ port: PORT }, () =>
    console.log(
      `🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`
    )
  );
};

main().catch((err) => console.error(err));
