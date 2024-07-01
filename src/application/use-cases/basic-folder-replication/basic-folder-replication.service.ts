import { Injectable } from '@nestjs/common';

@Injectable()
export class FoldersChangeHandlerService {
  //   listen to basic folder changes and
  //   listen to hierarchy changes
  //   debounce for TREE_CALCULATION_DEBOUNCE_TIME (configurable)
  //   run the tree-calc service
  //   save the computed tree to the repository
}
