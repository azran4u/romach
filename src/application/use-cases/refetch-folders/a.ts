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
