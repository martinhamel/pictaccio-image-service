import { ConfigSchema } from '../../core/config_schema';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { Serializable, fork } from 'node:child_process';
import { Inject, Service } from 'typedi';
import { config } from '../../config';

let count = 0;

@Service()
export default class JobsService {
    public run<T extends Serializable>(jobName: string, message: T): Promise<void> {
        // const worker = new Worker(join(this.config.env.dirs.root, `jobs/${jobName}.js`));
        // worker.postMessage(message);
        //
        // return new Promise((resolve) => {
        //     worker.on('message', () => resolve());
        // });

        return new Promise((resolve) => {
            const processJob = () => {
                const child = fork(join(config.env.dirs.root, `jobs/${jobName}.ts`), {
                    stdio: 'inherit'
                });

                count++;
                console.log('Creating worker, total count: ' + count);

                child.on('message', () => {
                    child.kill();
                    resolve();
                });

                child.on('exit', (code) => {
                    count--;
                    console.log('Exiting worker, total count: ' + count);
                    if (code) {
                        console.log('Worker exited with code ' + code);

                        setTimeout(() => {
                            //TODO: Could lead to infinite loop if the job is not processed and stack overflow
                            processJob();
                        }, 600000);
                    }
                });

                setTimeout(() => {
                    child.kill();

                    setTimeout(() => {
                        //TODO: Could lead to infinite loop if the job is not processed and stack overflow
                        processJob();
                    }, 600000);
                }, 180000);

                child.send(message);
            }

            processJob();
        });
    }
}
