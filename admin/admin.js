import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";

import Server from "../models/Server.js";
import WireguardClient from "../models/WireguardClient.js";

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

export function buildAdminRouter(app) {
  console.log("✅ buildAdminRouter CALLED"); // 👈 MUHIM LOG

  const admin = new AdminJS({
    rootPath: "/admin",
    resources: [
      { resource: Server },
      { resource: WireguardClient },
    ],
  });

  const router = AdminJSExpress.buildRouter(admin);

  console.log("✅ AdminJS rootPath:", admin.options.rootPath); // 👈 MUHIM LOG

  app.use(admin.options.rootPath, router);
}
