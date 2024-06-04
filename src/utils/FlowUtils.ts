import ms from "ms";

export class FlowUtils {
  public static delay(time: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms(time)));
  }
}
