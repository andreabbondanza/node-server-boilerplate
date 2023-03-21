import { Express } from "express";
import { AppEnvironment } from "../AppEnvironment";

export interface IController
{
    env: AppEnvironment;
}