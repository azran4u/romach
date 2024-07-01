
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class FolderStatus {
    id: string;
    status: string;
}

export abstract class IQuery {
    abstract checkFolder(folderId: string, password: string): Nullable<Nullable<FolderStatus>[]> | Promise<Nullable<Nullable<FolderStatus>[]>>;

    abstract registerFolders(idd: Nullable<string>[]): Nullable<Nullable<FolderStatus>[]> | Promise<Nullable<Nullable<FolderStatus>[]>>;
}

type Nullable<T> = T | null;
