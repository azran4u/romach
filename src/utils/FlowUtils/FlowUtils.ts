export class FlowUtils {
  public static delay(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}
