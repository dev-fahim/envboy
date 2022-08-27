import Queue, {Job} from "bull";
import {buildAndRunCFile} from "./runners";

export interface RunnerJobData {
  code: string;
  input: string;
}

const runnerQueue = new Queue<RunnerJobData>('runner');

const addBuildProcess = async (job: Job<RunnerJobData>) => {
  buildAndRunCFile(job.data.code, job.data.input);
};

runnerQueue.process(addBuildProcess);

const addBuild = (data: any) => {
  return runnerQueue.add(data, {});
}

export default {
  addBuild
}
