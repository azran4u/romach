import { Injectable } from '@nestjs/common';

@Injectable()
export class BasicFolderReplicationService {
    /* 
        replicate basic folders by timestamp
        compare (by updatedAt) every changed folder with the current folder in the database
        if the folder is not in the database, add it to changed folders
        if there are changed folders,
            add them to the database
            recalculate tree
        else
            do nothing        
    */
}
