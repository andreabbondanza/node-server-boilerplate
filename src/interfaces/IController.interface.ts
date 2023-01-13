import { Express } from "express";
import { AppEnvironment } from "../AppEnvironment";
import { MYSqlService } from "../services/MYSqlService.service";
import { FileService } from "../services/FileService.service";

export interface IController
{
    env: AppEnvironment;
    dbService: MYSqlService | null;
    fileService: FileService | null;
}