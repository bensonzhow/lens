/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import yaml from "js-yaml";
import { BaseEncodingOptions, readFile } from "fs-extra";
import { promiseExecFile } from "../../common/utils/promise-exec";
import { helmCli } from "./helm-cli";
import { Singleton } from "../../common/utils/singleton";
import { customRequestPromise } from "../../common/request";
import orderBy from "lodash/orderBy";
import logger from "../../common/logger";
import type { ExecFileOptions } from "child_process";

export type HelmEnv = Record<string, string> & {
  HELM_REPOSITORY_CACHE?: string;
  HELM_REPOSITORY_CONFIG?: string;
};

export interface HelmRepoConfig {
  repositories: HelmRepo[]
}

export interface HelmRepo {
  name: string;
  url: string;
  cacheFilePath?: string
  caFile?: string,
  certFile?: string,
  insecureSkipTlsVerify?: boolean,
  keyFile?: string,
  username?: string,
  password?: string,
}

async function execHelm(args: string[], options?: BaseEncodingOptions & ExecFileOptions): Promise<string> {
  const helmCliPath = await helmCli.binaryPath();

  try {
    const { stdout } = await promiseExecFile(helmCliPath, args, options);

    return stdout;
  } catch (error) {
    throw error?.stderr || error;
  }
}

export class HelmRepoManager extends Singleton {
  protected repos: HelmRepo[];
  protected helmEnv: HelmEnv;
  protected initialized: boolean;

  public static async loadAvailableRepos(): Promise<HelmRepo[]> {
    const res = await customRequestPromise({
      uri: "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json",
      json: true,
      resolveWithFullResponse: true,
      timeout: 10000,
    });

    return orderBy<HelmRepo>(res.body, repo => repo.name);
  }

  private async init() {
    await helmCli.ensureBinary();

    if (!this.initialized) {
      this.helmEnv = await HelmRepoManager.parseHelmEnv();
      await HelmRepoManager.update();
      this.initialized = true;
    }
  }

  protected static async parseHelmEnv() {
    const output = await execHelm(["env"]);
    const lines = output.split(/\r?\n/); // split by new line feed
    const env: HelmEnv = {};

    lines.forEach((line: string) => {
      const [key, value] = line.split("=");

      if (key && value) {
        env[key] = value.replace(/"/g, ""); // strip quotas
      }
    });

    return env;
  }

  public async repo(name: string): Promise<HelmRepo> {
    const repos = await this.repositories();

    return repos.find(repo => repo.name === name);
  }

  private async readConfig(): Promise<HelmRepoConfig> {
    try {
      const rawConfig = await readFile(this.helmEnv.HELM_REPOSITORY_CONFIG, "utf8");
      const parsedConfig = yaml.load(rawConfig);

      if (typeof parsedConfig === "object" && parsedConfig) {
        return parsedConfig as HelmRepoConfig;
      }
    } catch { }

    return {
      repositories: [],
    };
  }

  public async repositories(): Promise<HelmRepo[]> {
    try {
      if (!this.initialized) {
        await this.init();
      }

      const { repositories } = await this.readConfig();

      if (!repositories.length) {
        await HelmRepoManager.addRepo({ name: "bitnami", url: "https://charts.bitnami.com/bitnami" });

        return await this.repositories();
      }

      return repositories.map(repo => ({
        ...repo,
        cacheFilePath: `${this.helmEnv.HELM_REPOSITORY_CACHE}/${repo.name}-index.yaml`,
      }));
    } catch (error) {
      logger.error(`[HELM]: repositories listing error`, error);

      return [];
    }
  }

  public static async update() {
    return execHelm([
      "repo",
      "update",
    ]);
  }

  public static async addRepo({ name, url }: HelmRepo) {
    logger.info(`[HELM]: adding repo "${name}" from ${url}`);

    return execHelm([
      "repo",
      "add",
      name,
      url,
    ]);
  }

  public static async addCustomRepo({ name, url, insecureSkipTlsVerify, username, password, caFile, keyFile, certFile }: HelmRepo) {
    logger.info(`[HELM]: adding repo ${name} from ${url}`);
    const args = [
      "repo",
      "add",
      name,
      url,
    ];

    if (insecureSkipTlsVerify) {
      args.push("--insecure-skip-tls-verify");
    }

    if (username) {
      args.push("--username", username);
    }

    if (password) {
      args.push("--password", password);
    }

    if (caFile) {
      args.push("--ca-file", caFile);
    }

    if (keyFile) {
      args.push("--key-file", keyFile);
    }

    if (certFile) {
      args.push("--cert-file", certFile);
    }

    return execHelm(args);
  }

  public static async removeRepo({ name, url }: HelmRepo): Promise<string> {
    logger.info(`[HELM]: removing repo ${name} (${url})`);

    return execHelm([
      "repo",
      "remove",
      name,
    ]);
  }
}
