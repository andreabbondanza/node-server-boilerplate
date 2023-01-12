import { Express } from "express";
import { AppEnvironment } from "../AppEnvironment";
import { DBService } from "../services/DBService.service";
import { FileService } from "../services/FileService.service";

export interface IController
{
    env: AppEnvironment;
    dbService: DBService | null;
    fileService: FileService | null;
}