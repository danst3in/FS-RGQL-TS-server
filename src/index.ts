import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

const main = async () => {
  const orm = await MikroORM.init({
    entities: [Post],
    dbName: "lireddit",
    // user:'',
    // password:'',
    type: "postgresql",
    debug: !__prod__,
  });

  //  create instance of post
  const post = orm.em.create(Post, { title: "my first post" });
  // insert post into the database
  await orm.em.persistAndFlush(post);
  // await orm.em.nativeInsert(Post, { title: "my first post 2" });
};

main().catch((err) => console.error(err));
