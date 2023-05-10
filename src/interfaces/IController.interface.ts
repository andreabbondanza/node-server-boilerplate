import { Express } from "express";
import { AppEnvironment } from "../AppEnvironment.js";

export interface IController
{
    env: AppEnvironment;
}