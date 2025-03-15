import util from 'util';
import fs from 'fs';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class FeedbackServices {
  public dataFile: string;

  constructor(data: string) {
    this.dataFile = data;
  };

  async addEntry(name: string, title: string, message: string) {
    const data = await this.getData();
    data.unshift({ name, title, message });
    return writeFile(this.dataFile, JSON.stringify(data));
  };

  async getList() {
    const data = await this.getData();
    console.log(data);
    return data;
  };

  async getData(): Promise<{ name: string, title: string, message: string }[]> {
    const data = await readFile(this.dataFile, 'utf8');
    if (!data) return [];
    return JSON.parse(data);
  };
};

export default FeedbackServices;