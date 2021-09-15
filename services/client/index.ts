import { Options, Result } from './interface';
import ky from 'ky';
import { parseURL } from './utils/url';
import { Author } from './utils/auth';
import { Stats } from './type/stats';
import { MutationPoliciesResponse } from './type';

const withSchema = (ssh: boolean, url: string) => {
  return ssh ? 'https://' : 'http://' + url;
};

export class Client {
  private leader: string = '';
  private request: typeof ky = ky;
  public clusterStats?: Stats;
  constructor(opts?: Options) {
    if (opts) this.init(opts);
  }

  init({ leader, ssl, fetch: customFetch, cluster, auth }: Options) {
    this.leader = leader ?? cluster[0];
    this.request = ky.create({
      prefixUrl: withSchema(ssl, parseURL(this.leader)),
      fetch: customFetch,
      headers: { ...Author[auth.type](auth) },
    });
  }
  async stats(): Promise<Result<Stats>> {
    try {
      const stats = await this.request('stats').json<Stats>();
      this.clusterStats = stats;
      return stats;
    } catch (e) {
      console.error(e);
      return new Error('failed to request server');
    }
  }
  async namespaces(): Promise<Result<string[]>> {
    try {
      return await this.request('list/namespaces').json<string[]>();
    } catch (e) {
      console.error(e);
      return new Error('failed to request server');
    }
  }
  async model(ns: string): Promise<Result<string>> {
    try {
      return await this.request('print/model', {
        method: 'post',
        json: { ns: ns },
      }).json<string>();
    } catch (e) {
      console.error(e);
      return new Error('failed to request server');
    }
  }
  async policies(ns: string): Promise<Result<string[][]>> {
    try {
      return await this.request('list/policies', {
        method: 'post',
        json: { ns: ns },
      }).json<string[][]>();
    } catch (e) {
      console.error(e);
      return new Error('failed to request server');
    }
  }
  async addPolicies(
    ns: string,
    sec: string,
    ptype: string,
    rules: string[][]
  ): Promise<Result<MutationPoliciesResponse>> {
    try {
      return await this.request('add/policies', {
        method: 'post',
        json: { ns: ns, sec, ptype, rules },
      }).json<MutationPoliciesResponse>();
    } catch (e) {
      console.error(e);
      return new Error('failed to request server');
    }
  }
  async updatePolicies(
    ns: string,
    sec: string,
    ptype: string,
    newRules: string[][],
    oldRules: string[][]
  ): Promise<Result<MutationPoliciesResponse>> {
    try {
      return await this.request('update/policies', {
        method: 'post',
        json: { ns: ns, sec, ptype, newRules, oldRules },
      }).json<MutationPoliciesResponse>();
    } catch (e) {
      console.error(e);
      return new Error('failed to request server');
    }
  }
  async removePolicies(
    ns: string,
    sec: string,
    ptype: string,
    rules: string[][]
  ): Promise<Result<MutationPoliciesResponse>> {
    try {
      return await this.request('remove/policies', {
        method: 'post',
        json: { ns: ns, sec, ptype, rules },
      }).json<MutationPoliciesResponse>();
    } catch (e) {
      console.error(e);
      return new Error('failed to request server');
    }
  }
}
