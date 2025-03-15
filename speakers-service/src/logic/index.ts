import util from 'util';
import fs from 'fs';
import axios, { AxiosRequestConfig } from 'axios';

const readFile = util.promisify(fs.readFile);
interface Speaker {
  title: string
  name: string
  shortname: string
  summary: string
  description: string
  artwork: string[]
};

export interface Service {
  name: string;
  version: string;
  port: string;
  ip: string;
  timestamp?: number;
};

class SpeakersServices {
  public dataFile: string;

  constructor(data: string) {
    this.dataFile = data;
  };

  async getNames() {
    const data = await this.getData();

    return data.map(speaker => ({
      name: speaker.name,
      shortname: speaker.shortname,
    }));
  };

  async getListShort() {
    const data = await this.getData();
    return data.map(speaker => ({
      name: speaker.name,
      shortname: speaker.shortname,
      title: speaker.title,
    }));
  };

  async getList() {
    const data = await this.getData();
    return data.map(speaker => ({
      name: speaker.name,
      shortname: speaker.shortname,
      title: speaker.title,
      summary: speaker.summary,
    }));
  };

  async getAllArtworks() {
    const data = await this.getData();
    const artwork = data.reduce((acc, elm) => {
      if (elm.artwork) {
        acc = [...acc, ...elm.artwork];
      }
      return acc;
    }, []);
    return artwork;
  };

  async getSpeaker(shortname: string) {
    const data = await this.getData();
    const speaker = data.find(current => current.shortname === shortname);
    if (!speaker) return null;
    return {
      title: speaker.title,
      name: speaker.name,
      shortname: speaker.shortname,
      description: speaker.description,
    };
  };

  async getArtworkForSpeaker(shortname: string) {
    const data = await this.getData();
    const speaker = data.find(current => current.shortname === shortname);
    if (!speaker || !speaker.artwork) return null;
    return speaker.artwork;
  };

  async getData(): Promise<Speaker[]> {
    const data = await readFile(this.dataFile, 'utf8');
    if (!data) return [];
    return JSON.parse(data).speakers;
  };

  async getService (servicename: string): Promise<Service> {
    const res = await axios.get(`http://localhost:5001/find/${servicename}/1`);
    return res.data;
  };

  async callService (reqOptions: AxiosRequestConfig) {
    const res = await axios(reqOptions);
    return res.data;
  };
};

export default SpeakersServices;