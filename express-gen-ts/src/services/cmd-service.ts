import SocketIO from "socket.io";
import {spawn} from "child_process";
import {randomUUID} from "crypto";
import * as fs from "fs";


/**
 * Build and run c/c++ file.
 *
 * @param socket
 * @param code
 * @param input
 * @param completed
 * @returns
 */
function buildAndRunCFile(socket: SocketIO.Socket, code: string, input: string, completed: Function): void {
  code = "#define ONLINE_JUDGE true\n" + code
  const gcc = "g++";
  const name = randomUUID();
  const filename = name + "/c-file.cpp";
  
  fs.mkdirSync(name);
  
  fs.writeFile(filename, code, (err) => {
	const objectFile = name + "/c-object";
	
	const cmd = spawn(gcc, [filename, "-o", objectFile]);
	
	cmd.stdout.on("data", data => {
	  socket.emit("stdout", data.toString());
	});
	cmd.stderr.on("data", data => {
	  socket.emit("stderr", data.toString());
	});
	
	cmd.on('close', (code: number, data) => {
	  fs.rmSync(filename);
	  
	  if (code !== 0) {
		fs.rmdirSync(name);
		completed();
		return;
	  }
	  
	  const ncmd = spawn("./" + objectFile);
	  
	  ncmd.stdout.on("data", data => {
		socket.emit("stdout", data.toString());
	  });
	  ncmd.stderr.on("data", data => {
		socket.emit("stderr", data.toString());
	  });
	  ncmd.on('close', (code: number, data) => {
		fs.rmSync(objectFile);
		fs.rmdirSync(name);
		completed();
	  });
	  ncmd.on('error', (data) => {
		socket.emit("stderr", data.toString());
	  });
	  
	  ncmd.stdin.write(input);
	  ncmd.stdin.end();
	});
	cmd.on("error", data => {
	  socket.emit("stderr", data.toString());
	});
  });
}


/**
 * Build and run c/c++ file.
 *
 * @param socket
 * @param code
 * @param input
 * @param completed
 * @returns
 */
function buildAndRunJavaFile(socket: SocketIO.Socket, code: string, input: string, completed: Function): void {
  const javac = "javac";
  const java = "java";
  
  const name = __dirname + "/" + randomUUID();
  
  fs.mkdirSync(name);
  
  process.chdir(name);
  
  const filename = "Main.java";
  
  fs.writeFile(filename, code, (err) => {
	const objectFile = "Main";
	
	const cmd = spawn(javac, [filename]);
	
	cmd.stdout.on("data", data => {
	  socket.emit("stdout", data.toString());
	});
	cmd.stderr.on("data", data => {
	  socket.emit("stderr", data.toString());
	});
	
	cmd.on('close', (code: number, data) => {
	  fs.rmSync(filename);
	  
	  if (code !== 0) {
		fs.rmdirSync(name);
		completed();
		return;
	  }
	  
	  const ncmd = spawn(java, [objectFile]);
	  
	  ncmd.stdout.on("data", data => {
		socket.emit("stdout", data.toString());
	  });
	  ncmd.stderr.on("data", data => {
		socket.emit("stderr", data.toString());
	  });
	  
	  ncmd.on('close', () => {
		fs.rmSync(objectFile + '.class');
		fs.rmdirSync(name);
		completed();
	  });
	  ncmd.on('error', (data) => {
		socket.emit("stderr", data.toString());
	  });
	  
	  ncmd.stdin.write(input);
	  ncmd.stdin.end();
	});
	cmd.on("error", data => {
	  socket.emit("stderr", data.toString());
	});
  });
}

function buildAndRunPythonFile(socket: SocketIO.Socket, code: string, input: string, completed: Function): void {
  const python3 = "python3";
  const name = randomUUID();
  const filename = name + "/py-file.py";
  
  fs.mkdirSync(name);
  
  fs.writeFile(filename, code, (err) => {
	const cmd = spawn(python3, [filename]);
	cmd.stdout.on("data", data => {
	  socket.emit("stdout", data.toString());
	});
	cmd.stderr.on("data", data => {
	  socket.emit("stderr", data.toString());
	});
	cmd.on('close', (code: number, data) => {
	  fs.rmSync(filename);
	  fs.rmdirSync(name);
	  completed();
	});
	cmd.on("error", data => {
	  socket.emit("stderr", data.toString());
	});
	cmd.stdin.write(input);
	cmd.stdin.end();
  });
}

const programType: any = {
  c: buildAndRunCFile,
  java: buildAndRunJavaFile,
  py3: buildAndRunPythonFile
};

function buildAndRun(socket: SocketIO.Socket, code: string, input: string, type: string, completed: Function): void {
	return programType[type](socket, code, input, completed);
}

export default {
  buildAndRunCFile,
  buildAndRunPythonFile,
  buildAndRunJavaFile,
  buildAndRun
} as const;