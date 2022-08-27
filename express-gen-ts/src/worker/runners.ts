import {randomUUID} from "crypto";
import fs from "fs";
import {spawn} from "child_process";

export interface ReturnObject {
  type: string;
  message: string;
}

/**
 * Build and run c/c++ file.
 *
 * @param code
 * @param input
 * @returns
 */
export function buildAndRunCFile (code: string, input: string): void {
  code = "#define ONLINE_JUDGE true\n" + code
  const gcc = "g++";
  const name = randomUUID();
  const filename = name + "/c-file.cpp";
  
  fs.mkdirSync(name);
  
  fs.writeFile(filename, code, (err) => {
	const objectFile = name + "/c-object";
	
	const cmd = spawn(gcc, [filename, "-o", objectFile]);
	
	cmd.stdout.on("data", data => {
	  return {type: 'stdout', message: data.toString()};
	});
	cmd.stderr.on("data", data => {
	  return {type: 'stderr', message: data.toString()};
	});
	
	cmd.on('close', (code: number, data) => {
	  fs.rmSync(filename);
	  
	  if (code !== 0) {
		fs.rmdirSync(name);
		return;
	  }
	  
	  const n_cmd = spawn("./" + objectFile);
	  
	  n_cmd.stdout.on("data", data => {
		return {type: 'stdout', message: data.toString()};
	  });
	  n_cmd.stderr.on("data", data => {
		return {type: 'stderr', message: data.toString()};
	  });
	  n_cmd.on('close', (code: number, data) => {
		fs.rmSync(objectFile);
		fs.rmdirSync(name);
	  });
	  n_cmd.on('error', (data) => {
		return {type: 'stderr', message: data.toString()};
	  });
	  
	  n_cmd.stdin.write(input);
	  n_cmd.stdin.end();
	});
	cmd.on("error", data => {
	  return {type: 'stderr', message: data.toString()};
	});
  });
}
