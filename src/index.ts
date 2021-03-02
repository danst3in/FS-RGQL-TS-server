import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
const main = async () => {
  // connect to db
  const orm = await MikroORM.init(mikroConfig);
  // run migrations here in code instead of cli
  await orm.getMigrator().up();
  // run sql commands
  //  create instance of post
  const post = orm.em.create(Post, { title: "my first post" });
  // insert post into the database
  await orm.em.persistAndFlush(post);
  // await orm.em.nativeInsert(Post, { title: "my first post 2" });

  // find all posts
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);
};

main().catch((err) => console.error(err));
