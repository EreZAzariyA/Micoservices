import axios, { AxiosRequestConfig } from "axios";

enum Circuit {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF = 'HALF'
};

interface EndpointState {
  failures: number;
  coolDownPeriod: number;
  circuit: Circuit,
  nextTry: number
}

class CircuitBreaker {
  public states: Record<string, EndpointState>;
  public failureThreshold: number;
  public coolDownPeriod: number;
  public requestTimeout: number;

  constructor() {
    this.states = {};
    this.failureThreshold = 5;
    this.coolDownPeriod = 10;
    this.requestTimeout = 2;
  };

  async callService(reqOptions: AxiosRequestConfig) {
    const endpoint = `${reqOptions.method}:${reqOptions.url}`;
    if (!this.canRequest(endpoint)) return false;

    reqOptions.timeout = (this.requestTimeout * 1000);

    try {
      const res = await axios(reqOptions);
      this.onSuccess(endpoint);
      return res.data;
    } catch (error) {
      this.onFailure(endpoint);
      return false;
    }
  }

  onSuccess(endpoint: string) {
    this.initialState(endpoint);
  };

  onFailure(endpoint: string) {
    const endpointState = this.states[endpoint];
    endpointState.failures += 1;
    if (endpointState.failures > this.failureThreshold) {
      endpointState.circuit = Circuit.OPEN;
      endpointState.nextTry = new Date().valueOf() + (this.coolDownPeriod * 1000);
      console.log(`Alert! Circuit for ${endpoint} is in state 'OPEN'`);
    };
  };

  canRequest(endpoint: string) {
    if (!this.states[endpoint]) this.initialState(endpoint);
    const endpointState = this.states[endpoint];
    if (endpointState.circuit === Circuit.CLOSED) return true;

    const now = new Date().valueOf();
    if (endpointState.nextTry <= now) {
      endpointState.circuit = Circuit.HALF;
      return true;
    }
    return false;
  };

  initialState(endpoint: string) {
    this.states[endpoint] = {
      failures: 0,
      coolDownPeriod: this.coolDownPeriod,
      circuit: Circuit.CLOSED,
      nextTry: 0
    };
  };
};

export default  CircuitBreaker;