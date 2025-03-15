import url from 'url';
import axios, { AxiosRequestConfig } from 'axios';
import CircuitBreaker from '../lib/CircuitBreaker';
import { createHash } from 'crypto';
import fs from 'fs';
import util from 'util';

export interface Service {
  name: string;
  version: string;
  port: string;
  ip: string;
  timestamp?: number;
};

const circuitBreaker = new CircuitBreaker();
const fsExists = util.promisify(fs.exists);

class SpeakersServices {
  public serviceRegistryUrl: string;
  public serviceVersion: string;
  public cache: object;

  constructor({ serviceRegistryUrl, serviceVersion }) {
    this.serviceRegistryUrl = serviceRegistryUrl;
    this.serviceVersion = serviceVersion;
    this.cache = {};
  };

  async getImage(path: string) {
    const { ip, port } = await this.getService('speakers-services');
    return this.callService({
      method: 'get',
      responseType: 'stream',
      url: `http://${ip}:${port}/images/${path}`,
    });
  };

  async getNames() {
    const { ip, port } = await this.getService('speakers-services');
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/names`,
    });
  };

  async getListShort() {
    const { ip, port } = await this.getService('speakers-services');
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/list-short`,
    });
  };

  async getList() {
    const { ip, port } = await this.getService('speakers-services');
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/list`,
    });
  };

  async getAllArtworks() {
    const { ip, port } = await this.getService('speakers-services');
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/artworks`,
    });
  };

  async getSpeaker(shortname: string) {
    const { ip, port } = await this.getService('speakers-services');
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/speaker/${shortname}`
    });
  };

  async getArtworkForSpeaker(shortname: string): Promise<string[] | null> {
    const { ip, port } = await this.getService('speakers-services');
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/artwork/${shortname}`
    });
  };

  async getService (servicename: string): Promise<Service> {
    const res = await axios.get(`http://localhost:5001/find/${servicename}/1`);
    return res.data;
  };

  async callService (reqOptions: AxiosRequestConfig) {
    const servicePath = url.parse(reqOptions.url).path;
    const cacheKey = createHash('md5').update(reqOptions + servicePath).digest('hex');
    let cacheFile = null;

    if (reqOptions.responseType && reqOptions.responseType === 'stream') {
      cacheFile = `${__dirname}/../../_imagecache/${cacheKey}`;
    }

    const result = await circuitBreaker.callService(reqOptions);

    if (!result) {
      if (this.cache[cacheKey]) return this.cache[cacheKey];
      if (cacheFile) {
        const exists = await fsExists(cacheFile);
        if (exists) return fs.createReadStream(cacheFile);
      }

      return false;
    }

    if (!cacheFile) {
      this.cache[cacheKey] = result;
    } else {
      const ws = fs.createWriteStream(cacheFile);
      result.pipe(ws);
    }

    return result;
  };
};

export default SpeakersServices;