import cmdService from "@services/cmd-service";
import {Request, Response, Router} from 'express';
import StatusCodes from 'http-status-codes';
import SocketIO from "socket.io";
import {RoomNotFoundError} from "@shared/errors";
import {runnerQueue} from "../worker/queue";
import {randomUUID} from "crypto";


// Constants
const router = Router();
const {OK} = StatusCodes;

// Paths
export const p = {
  run_c: '/run-c',
  run_java: '/run-java',
  run_py3: '/run-py3',
} as const;

/**
 * Run c file in socket and streams stdout logs
 */
router.post(p.run_c, async (req: Request, res: Response) => {
  const {socketId, code, input} = req.body;
  const io: SocketIO.Server = req.app.get('socketio');
  const socket = io.sockets.sockets.get(socketId);
  if (!socket) {
	throw new RoomNotFoundError();
  }
  // cmdService.buildAndRunCFile(socket, code, input);
  const run = randomUUID();
  await runnerQueue.run(socket, run, code, input, 'c');
  
  return res.status(OK).end();
});

/**
 * Run java file in socket and streams stdout logs
 */
router.post(p.run_java, async (req: Request, res: Response) => {
  const {socketId, code, input} = req.body;
  const io: SocketIO.Server = req.app.get('socketio');
  const socket = io.sockets.sockets.get(socketId);
  if (!socket) {
    throw new RoomNotFoundError();
  }
  // cmdService.buildAndRunJavaFile(socket, code, input);
  const run = randomUUID();
  await runnerQueue.run(socket, run, code, input, 'java');
  return res.status(OK).end();
});

/**
 * Run python3 file in socket and streams stdout logs
 */
router.post(p.run_py3, async (req: Request, res: Response) => {
  const {socketId, code, input} = req.body;
  const io: SocketIO.Server = req.app.get('socketio');
  const socket = io.sockets.sockets.get(socketId);
  if (!socket) {
	throw new RoomNotFoundError();
  }
  // cmdService.buildAndRunPythonFile(socket, code, input);
  const run = randomUUID();
  await runnerQueue.run(socket, run, code, input, 'py3');
  return res.status(OK).end();
});


export default router;
