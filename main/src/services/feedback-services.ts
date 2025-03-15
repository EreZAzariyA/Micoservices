import url from 'url';
import fs from 'fs';
import util from 'util';
import amqplib from 'amqplib';
import { createHash } from 'crypto';
import axios, { AxiosRequestConfig } from 'axios';
import CircuitBreaker from '../lib/CircuitBreaker';
import { Service } from './speakers-service';

const circuitBreaker = new CircuitBreaker();
const fsExists = util.promisify(fs.exists);

class FeedbackServices {
  public serviceRegistryUrl: string;
  public serviceVersion: string;
  public cache: object;

  constructor({ serviceRegistryUrl, serviceVersion }) {
    this.serviceRegistryUrl = serviceRegistryUrl;
    this.serviceVersion = serviceVersion;
    this.cache = {};
  };

  async addEntry(name: string, title: string, message: string) {
    const q = 'feedback';
    const conn = await amqplib.connect('amqp://localhost');
    const ch = await conn.createChannel();
    await ch.assertQueue(q);
    const qm = JSON.stringify({ name, title, message });
    return ch.sendToQueue(q, Buffer.from(qm, 'utf8'));
  };

  async getList() {
    const { ip, port } = await this.getService('feedback-services');
    return this.callService({
      method: 'get',
      url: `http://${ip}:${port}/list`
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

export default FeedbackServices;