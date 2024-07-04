import { LeaderElectionInterface } from '../interfaces/leader-election.interface';

export function leaderElectionInterfaceMockBuilder(): LeaderElectionInterface  {
  return {
    isLeader: jest.fn(),
  };
};
