// global-agent and undici are used for proxying http requests for debugging purposes
import 'global-agent/bootstrap';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

if (process.env['GLOBAL_AGENT_HTTP_PROXY']) {
  setGlobalDispatcher(new ProxyAgent(process.env['GLOBAL_AGENT_HTTP_PROXY']));
}
console.log('boostraping debugging proxy to', process.env['GLOBAL_AGENT_HTTP_PROXY']);
