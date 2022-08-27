import {Socket} from "socket.io";
import runners from '@services/cmd-service';

export class RunnerQueue {
  queue: string[] = [];
  nowRunning?: string;
  
  async run(socket: Socket, run: string, code: string, input: string, type: string): Promise<void> {
	this.queue.push(run);
	if (!this.nowRunning) {
	  this.nowRunning = this.queue.shift();
	}
	
	const interval = setInterval(() => {
	  console.log(this.queue.length);
	  if (socket.disconnected) {
		clearInterval(interval);
	  }
	  if (this.nowRunning === run) {
		clearInterval(interval);
		socket.emit("status", "building...\n");
		
		runners.buildAndRun(socket, code, input, type, () => {
		  this.nowRunning = this.queue.shift();
		});
	  } else {
		socket.emit("status", "in queue...\n");
	  }
	}, 200);
	
  }
}


export const runnerQueue = new RunnerQueue();
