import { GoalStatus } from './goal.model';

describe('Goal', () => {
  it('should create an instance', () => {
    expect(GoalStatus.Active).toBeTruthy();
    expect(GoalStatus.Achieved).toBeTruthy();
    expect(GoalStatus.Failed).toBeTruthy();
  });
});
