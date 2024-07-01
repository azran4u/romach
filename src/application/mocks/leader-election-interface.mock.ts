import { LeaderElectionInterface } from '../interfaces/leader-election.interface';

export const leaderElectionInterfaceMock: LeaderElectionInterface = {
  start: jest.fn(),
  stop: jest.fn(),
  isLeader: jest.fn(),
};
