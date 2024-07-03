import { Observable } from 'rxjs';

export interface LeaderElectionInterface {
  isLeader(): Observable<boolean>;
}


