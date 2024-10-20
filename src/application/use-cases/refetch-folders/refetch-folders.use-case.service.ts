import { Injectable } from "@nestjs/common";
import { RomachEntitiesApiInterface } from "../../interfaces/romach-entities-api.interface";
import { RomachRepositoryInterface } from "../../interfaces/romach-repository.interface";
import { LeaderElectionInterface } from "../../interfaces/leader-election.interface";
import { AppLoggerService } from "../../../infra/logging/app-logger.service";
import { RealityId } from "../../entities/reality-id";
import { BasicFoldersUpdatedEvent, EventEmitterInterface, Event } from "src/application/interfaces/event-handler-interface";
import { BasicFolder } from "src/domain/entities/BasicFolder";
import { Folder } from "src/domain/entities/Folder";
import { partition } from "lodash";

export interface RefetchFoldersServiceOptions {
  romachApi: RomachEntitiesApiInterface;
  repository: RomachRepositoryInterface;
  logger: AppLoggerService;
  reality: RealityId;
  interval: number;
  chunkSize: number;
}

@Injectable()
export class RefetchFoldersService {
  constructor(private options: RefetchFoldersServiceOptions) {
  }

  // This function handles the refetch operation when folders are updated
  async execute() {
    this.options.logger.info(`Starting refetch for folders in reality ${this.options.reality}.`);

    // Divide the folders into protected and unprotected
    const { protectedFolders, unprotectedFolders } = this.divideFoldersByProtection(event.payload);

    // Refetch folders based on their protection status
    await this.refetchFolders(protectedFolders, unprotectedFolders);
  }

  // Divide folders into protected and unprotected
  private divideFoldersByProtection(folders: BasicFolder[]): { protectedFolders: string[], unprotectedFolders: string[] } {
    const [protectedFolders, unprotectedFolders] = partition(folders, folder => folder.getProps().isPasswordProtected);

    this.options.logger.debug(`Protected folders: ${protectedFolders.length}, Unprotected folders: ${unprotectedFolders.length}`);

    return {
      protectedFolders: protectedFolders.map(folder => folder.getProps().id),
      unprotectedFolders: unprotectedFolders.map(folder => folder.getProps().id),
    };
  }

  // Refetch the folders that need to be updated
  private async refetchFolders(protectedFolders: string[], unprotectedFolders: string[]): Promise<void> {
    await this.handleUnprotectedFolders(unprotectedFolders);
    await this.handleProtectedFolders(protectedFolders);
  }

  private async handleUnprotectedFolders(unprotectedFolders: string[]): Promise<void> {
    const chunks = this.chunkArray(unprotectedFolders, this.options.chunkSize);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (folderId) => {
          const folderResult = await this.options.romachApi.fetchFolderById(folderId);
          if (folderResult.isOk()) {
            const folder = folderResult.value() as Folder;
            await this.options.repository.updateFolderForAllUsers(folder);
          }
        })
      );
    }
  }

  private async handleProtectedFolders(protectedFolders: string[]): Promise<void> {
    for (const folderId of protectedFolders) {
      const passwords = await this.options.repository.findUniquePasswordsForFolder(folderId);

      for (const password of passwords) {
        try {
          const folderResult = await this.options.romachApi.fetchFolderByIdWithPassword(folderId, password);

          if (folderResult && folderResult.isOk && folderResult.isOk()) {
            const folder = folderResult.value() as Folder;
            await this.options.repository.updateFolderForUsersWithPassword(folder, password);
          } else {
            await this.options.repository.markPasswordInvalidForUsers(folderId, password);
          }
        } catch (error) {
          await this.options.repository.markPasswordInvalidForUsers(folderId, password);
        }
      }
    }
  }

  // Utility function to split an array into chunks for batch processing
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
