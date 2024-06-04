import { Observable } from 'rxjs';

export interface LeaderElectionInterface {
  start(options?: LeaderElectionOptions): Promise<void>;
  stop(): void;
  isLeader(): Observable<boolean>;
}

export interface LeaderElectionOptions {
  task: string;
  processId?: string;
  schema?: string;
  lockRenewInSeconds?: number;
  lockTimeoutInSeconds?: number;
}
