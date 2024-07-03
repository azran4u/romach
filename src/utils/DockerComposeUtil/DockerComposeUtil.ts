import { exec } from 'child_process';

export class DockerComposeUtil {
  constructor(private composeFilePath: string) {}
  async start() {
    return new Promise((resolve, reject) => {
      exec(
        `docker-compose -f ${this.composeFilePath} up -d`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            reject(error);
            return;
          }
          resolve(stdout);
        },
      );
    });
  }

  async stop() {
    return new Promise((resolve, reject) => {
      exec(
        `docker-compose -f ${this.composeFilePath} down`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            reject(error);
            return;
          }
          resolve(stdout);
        },
      );
    });
  }
}
