import { IConfigDb } from "../interfaces/IConfigDb.interface";
import { createConnection, Connection, ResultSetHeader } from "mysql2/promise";
import { _DB_TABLES_ as DB_TABLES } from "../common/Globals.common";
import { AppEnvironment } from "../AppEnvironment";
import { Logger } from "../common/Logger.common";
import { GenericModel } from "../shared/Generic.model";
import { Repository } from "../common/Repository.common";

export class MYSqlRepository extends Repository
{
    private _connection: Connection | null = null;

    public async getConnection()
    {
        if (!this._connection)
            this._connection = await createConnection({
                host: this._cfg.db.host,
                user: this._cfg.db.usr,
                password: this._cfg.db.pwd,
                database: this._cfg.db.schema,
                port: this._cfg.db.port
            });
        return this._connection;
    }

    public async query<T>(query: string, params: any[] = [])
    {
        const conn = await this.getConnection();
        const [rows] = await conn.execute(query, params);
        return rows as T[];
    }

    public getSetValues<T extends GenericModel>(obj: T): UpSet<T>[]
    {
        const toUpdate: UpSet<T>[] = [];
        for (const prop of Object.keys(obj))
        {
            if (prop as keyof T !== "Id" && prop as keyof T !== "Created")
                toUpdate.push([prop as keyof T, (obj as any)[prop]])
        }
        return toUpdate;
    }

    /**
     * Simple select 
     * @param tname table name
     * @param conditions conditions
     * @returns array of T
     */

    public async select<T>(tname: DB_TABLES, conditions: Conditon<T> | Conditon<T>[] = [])
    {
        const conn = await this.getConnection();
        let query = `SELECT * FROM ${this._cfg.db.tprefix}${tname} WHERE`;
        const values = [];
        if (typeof conditions[0] === "string")
        {
            query += ` ${conditions[0]}${conditions[1]}? `;
            values.push(conditions[2]);
        }
        else
        {
            for (const condition of conditions)
            {
                query += ` ${condition[0]}${condition[1]}? `;
                query += "AND";
            }
            query = query.substring(0, query.length - 3) + ";";
            values.push(...conditions.map(x => x[2]));
        }
        this._logger.debug("-------------------------------------------------");
        this._logger.debug(`QUERY:\n${query}`);
        this._logger.debug(`Values:\n${JSON.stringify(values)}`);
        const [rows] = await conn.execute(query, values);
        this._logger.debug("RESULT:")
        this._logger.debug(JSON.stringify(rows));
        return rows as T[];
    }

    /**
     * Inserisce un elemento nel db
     * @param obj l'oggetto da inserire
     * @param tname il nome della tabella
     * @returns l'id dell'oggetto inserito
     */
    public async insert<T>(obj: T, tname: DB_TABLES): Promise<number>
    {
        const tableName = tname;
        const conn = await this.getConnection();
        let query = `INSERT INTO ${this._cfg.db.tprefix}${tableName} `;
        const columns: string[] = [];
        for (const column of Object.keys(obj as any))
        {
            columns.push(column);
        }
        const ph: string[] = [];
        const values: any[] = [];
        for (const column of Object.values(obj as any))
        {
            ph.push("?");
            values.push(column);
        }
        query += `(${columns.join(",")}) VALUES (${ph.join(",")})`;
        this._logger.debug("-------------------------------------------------");
        this._logger.debug(`QUERY:\n${query}`);
        this._logger.debug(`Values:\n${JSON.stringify(values)}`);
        const [res] = await conn.execute(query, values);
        const rsheader: ResultSetHeader = res as ResultSetHeader;
        if (rsheader.affectedRows > 0) return rsheader.insertId;
        return 0;
    }
    /**
     * Aggiorna un elemento
     * @param columns le colonne con i valori da aggiornare
     * @param conditions la condizione o le condizioni
     * @param tname nome tabella
     * @returns ritorna il numero di righe affette dall'update
     */
    public async update<T>(columns: UpSet<T>[], conditions: Conditon<T>[] | Conditon<T>, tname: DB_TABLES): Promise<number>
    {
        const tableName = tname;
        const conn = await this.getConnection();
        let query = `UPDATE ${this._cfg.db.tprefix}${tableName} SET`;
        const values = [];
        for (const column of columns)
        {
            query += ` ${column[0].toString()}=? `;
            query += ",";
        }
        query = query.substring(0, query.length - 1) + "WHERE";
        values.push(...columns.map(x => x[1]));

        if (typeof conditions[0] === "string")
        {
            query += ` ${conditions[0]}${conditions[1]}? `;
            values.push(conditions[2]);
        }
        else
        {
            for (const condition of conditions)
            {
                query += ` ${condition[0]}${condition[1]}? `;
                query += "AND";
            }
            query = query.substring(0, query.length - 3) + ";";
            values.push(...conditions.map(x => x[2]));
        }
        this._logger.debug("-------------------------------------------------");
        this._logger.debug(`QUERY:\n${query}`);
        this._logger.debug(`Values:\n${JSON.stringify(values)}`);
        const [res] = await conn.execute(query, values);
        const rsheader: ResultSetHeader = res as ResultSetHeader;
        if (rsheader.affectedRows > 0) return rsheader.affectedRows;
        return 0;
    }
    /**
     * Cancella un elemento che rispetta le condizioni
     * @param conditions condizione o array di condizioni
     * @param tname nome tabella
     * @returns numero di righe affette dalla cancellazione
     */
    public async delete<T>(conditions: Conditon<T>[] | Conditon<T>, tname: DB_TABLES): Promise<number>
    {
        const tableName = tname;
        const conn = await this.getConnection();
        let query = `DELETE FROM ${this._cfg.db.tprefix}${tableName} WHERE`;
        const values = [];
        if (typeof conditions[0] === "string")
        {
            query += ` ${conditions[0]}${conditions[1]}? `;
            values.push(conditions[2]);
        }
        else
        {
            for (const condition of conditions)
            {
                query += ` ${condition[0]}${condition[1]}? `;
                query += "AND";
            }
            query = query.substring(0, query.length - 3) + ";";
            values.push(...conditions.map(x => x[2]));
        }
        this._logger.debug("-------------------------------------------------");
        this._logger.debug(`QUERY:\n${query}`);
        this._logger.debug(`Values:\n${JSON.stringify(values)}`);
        const [res] = await conn.execute(query, values);
        const rsheader: ResultSetHeader = res as ResultSetHeader;
        if (rsheader.affectedRows > 0) return rsheader.affectedRows;
        return 0;
    }

    public async startTransaction()
    {
        const conn = await this.getConnection();
        await conn.beginTransaction();
    }

    public async commit()
    {
        const conn = await this.getConnection();
        await conn.commit();
    }

    public async rollback()
    {
        const conn = await this.getConnection();
        await conn.rollback();
    }

}

export type Conditon<T> = [keyof T, string, any];

export type UpSet<T> = [keyof T, any];