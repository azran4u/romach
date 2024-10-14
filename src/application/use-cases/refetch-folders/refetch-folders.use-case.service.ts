import { Injectable } from "@nestjs/common";
import { tap, timer } from "rxjs";
import { RomachEntitiesApiInterface } from "../../interfaces/romach-entities-api.interface";
import { RomachRepositoryInterface } from "../../interfaces/romach-repository.interface";
import { LeaderElectionInterface } from "../../interfaces/leader-election.interface";
import { AppLoggerService } from "../../../infra/logging/app-logger.service";
import { RealityId } from "../../entities/reality-id";
import { RxJsUtils } from "../../../utils/RxJsUtils/RxJsUtils";
import { partition } from "lodash";

export interface RefetchFoldersServiceOptions {
  romachApi: RomachEntitiesApiInterface,
  repository: RomachRepositoryInterface,
  leaderElection: LeaderElectionInterface,
  logger: AppLoggerService,
  folderIds: string[],
  reality: RealityId,
  interval: number,
  chunkSize: number,
}

@Injectable()
export class RefetchFoldersService {

  constructor(
    private options: RefetchFoldersServiceOptions
  ) {
  }


  execute() {
    this.options.logger.info(`RefetchFoldersService has been initialized reality ${this.options.reality}.`);

    return this.options.leaderElection.isLeader().pipe(
      tap((isLeader) =>
        this.options.logger.info(
          `LeaderElection status has changed. Current status: ${isLeader}`
        )
      ),
      RxJsUtils.executeOnTrue(this.poller())
    );
  }

  private poller() {
    return timer(0, this.options.interval).pipe(
      tap(() => this.options.logger.debug(`Polling for folder updates, reailty ${this.options.reality}`)),
      tap(() => this.executeRefetchFolders())
    );
  }

  private async executeRefetchFolders() {
    const { protectedFolders, unprotectedFolders } = await this.divideFolders(this.options.folderIds);

    await this.handleUnprotectedFolders(unprotectedFolders);
    await this.handleProtectedFolders(protectedFolders);
  }

  // Divide folders into protected and unprotected
  private async divideFolders(folderIds: string[]): Promise<{ protectedFolders: string[], unprotectedFolders: string[] }> {
    const partitioned = await Promise.all(folderIds.map(async folderId => ({
      folderId,
      isProtected: await this.options.repository.isFolderProtected(folderId),
    })));

    const [protectedFolders, unprotectedFolders] = partition(partitioned, folder => folder.isProtected);

    return {
      protectedFolders: protectedFolders.map(folder => folder.folderId),
      unprotectedFolders: unprotectedFolders.map(folder => folder.folderId),
    };
  }


  // Handle unprotected folders
  private async handleUnprotectedFolders(unprotectedFolders: string[]): Promise<void> {
    const chunks = this.chunkArray(unprotectedFolders, this.options.chunkSize);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (folderId) => {
          const folderResult = await this.options.romachApi.fetchFolderById(folderId);
          if (folderResult.isOk()) {
            await this.options.repository.updateFolderForAllUsers(folderResult.value());
          }
        })
      );
    }
  }

  // Handle protected folders
  private async handleProtectedFolders(protectedFolders: string[]): Promise<void> {
    for (const folderId of protectedFolders) {
      const passwords = await this.options.repository.findUniquePasswordsForFolder(folderId);

      for (const password of passwords) {
        try {
          const folderResult = await this.options.romachApi.fetchFolderByIdWithPassword(folderId, password);

          if (folderResult && folderResult.isOk && folderResult.isOk()) {
            await this.options.repository.updateFolderForUsersWithPassword(folderResult.value(), password);
          } else {
            await this.options.repository.markPasswordInvalidForUsers(folderId, password);
          }
        } catch (error) {
          await this.options.repository.markPasswordInvalidForUsers(folderId, password);
        }
      }
    }
  }

  // divide the array into chunks
  private chunkArray(arr: string[], chunkSize: number): string[][] {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  }
}




// TODO
// divide the folderIds into two groups - protected and unprotected
// for unprotected folders
//      divide the folderIds into chunks of CHUNK_SIZE (configurable)
//      fetch from romach API where each chunk is a seperate Promise.all
//      update the repository with the fetched folders for all users
// for protected folders
//      for each folderId
//          find all unique passwords where the folderId is protected and password is valid
//          for each password
//              fetch from romach API with the password
//              if the fetch is successful
//                  update the repository with the fetched folder for all users with that password
//              else
//                  update the repository with the password as invalid for all users with that password
