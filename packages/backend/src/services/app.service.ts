import { Response } from "express";
import { ObjectID } from "mongodb";
import axios from "axios";

import { AppModel } from "../models/App";
import { IApp } from "../types/app.type";

interface ICreatePayload {
  app: IApp;
  res: Response;
}

interface IUpdatePayload {
  app: IApp;
  id: string;
  res: Response;
}

class AppsService {
  async getAllApps(res: Response) {
    const apps = await AppModel.find();

    if (!apps) {
      res.status(404).send({ message: "cannot get all apps" });
      return;
    }

    res.send(apps);
  }

  async getAppByTitle(title: string, res: Response) {
    const app = await AppModel.find({ title });

    if (!app) {
      res.status(404).send({ message: "cannot get app by title" });
      return;
    }

    console.log("getAppByTitle Service: ", app);
    res.send(app);
  }

  async getAppById(id: string, res: Response) {
    const app = await AppModel.findById(id);

    if (!app) {
      res.status(404).send({ message: "cannot get app by id" });
      return;
    }

    console.log("getAppById Service: ", app);
    res.send(app);
  }

  async createApp({ app, res }: ICreatePayload) {
    console.log("App", app);
    const createdApp = await AppModel.create(app);

    if (!createdApp) {
      res.status(400).send({ message: "Error while creating app" });
      return;
    }

    console.log("createdApp: ", createdApp);

    res.send(createdApp);
  }

  async updateApp({ app, res, id }: IUpdatePayload) {
    console.log("App", app);
    console.log("id", id);
    try {
      const updatedApp = await AppModel.findOneAndUpdate({ _id: id }, app, {
        new: true,
      });

      console.log("updatedApp: ", updatedApp);

      res.send(updatedApp);
    } catch (err) {
      console.error(err);
    }
  }

  async getAllAppsFromSteamAPI(res: Response) {
    const steamApiUrl =
      "http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json";

    try {
      const response = await axios.get(steamApiUrl);
      const appList = response.data.applist.apps;

      if (!appList || !Array.isArray(appList)) {
        res
          .status(404)
          .send({ message: "Cannot fetch app list from Steam API" });
        return;
      }

      const savedApps = await AppModel.insertMany(appList);

      console.log("Saved apps: ", savedApps);
      res.send(savedApps);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({
          message: "An error occurred while fetching and saving app list",
        });
    }
  }
}

export default AppsService