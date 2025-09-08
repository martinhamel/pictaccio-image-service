import { promises as fsPromises, Stats } from 'fs';
import path from 'path';
import { Container } from 'typedi';
import { isMainThread, parentPort, threadId } from 'worker_threads';
import { ConfigSchema } from '../../core/config_schema';
import { bootstrap } from '../../lib/bootstrap';
import { logger } from '../../lib/core/logger';
import { typediLoader } from '../../lib/loaders/typedi';
import { configLoader } from '../../lib/loaders/config';
import { typeormLoader } from '../../lib/loaders/typeorm';

type JobCacheItem = {
    callable: () => void
}

// Quit process if running from main thread
if (isMainThread) {
    console.error('[JOBSHOST] Imported on main thread');
    process.exit(1);
}

// Bootstrap loader selection for worker thread
bootstrap([
    typediLoader,
    configLoader,
    typeormLoader,
]).then(() => {
    const config = Container.get<ConfigSchema>('config');
    const jobCache: { [key: string]: JobCacheItem } = {};

    /**
     * Run a job in the worker thread. The first time the job is ran, the import is cached for subsequent runs
     * @param name The name of the script to run, must match the name of a file in src/jobs/*.js
     */
    async function runJob(name: string): Promise<void> {
        const scriptPath = path.join(config.env.dirs.jobs, name + '.js');
        let stat: Stats;

        try {
            stat = await fsPromises.stat(scriptPath);
        } catch (e) {
            stat = null;
        }

        if (stat !== null) {
            if (jobCache[name] === undefined) {
                jobCache[name] = {
                    callable: (await import(scriptPath)).default
                };
            }
            const job = jobCache[name];

            parentPort.emit('message', { type: 'job-started', name });
            logger.info(`Running '${name}' on worker thread '${threadId}'`, {
                area: 'JOBSHOST',
                jobName: name,
                threadId,
            });

            const start = process.hrtime();
            job.callable();
            const diff = process.hrtime(start);
            const diffMs = Math.ceil(diff[0] * 1000 + diff[1] / 1000000)

            logger.info(
                `Job '${name}' finished on worker thread '${threadId}' ` +
                `in ${diffMs}ms`, {
                area: 'JOBSHOST',
                jobName: name,
                durationInMs: diffMs,
                threadId
            });
            parentPort.emit('message', { type: 'job-stopped', name });
        } else {
            parentPort.emit('message', { type: 'job-invalid', name });
        }
    }

    parentPort.on('message', (msg) => {
        switch (msg.type) {
            case 'new-job':
                runJob(msg.name);
        }
    });
})
