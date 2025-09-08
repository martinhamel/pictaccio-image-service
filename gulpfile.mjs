import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import gutil from 'gulp-util';

gutil.log = gutil.noop;

export async function buildDockerAlpha() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const docker = (await readFile(join('.', 'Dockerfile'))).toString();

        await dockerBuild('pictaccio-image-service-alpha', docker, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
    } catch (error) {
        throw error;
    }
}

export async function buildDockerBeta() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const docker = (await readFile(join('.', 'Dockerfile'))).toString();

        await dockerBuild('pictaccio-image-service-beta', docker, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
    } catch (error) {
        throw error;
    }
}

export async function buildDockerProd() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const docker = (await readFile(join('.', 'Dockerfile'))).toString();

        await dockerBuild('pictaccio-image-service-prod', docker, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
    } catch (error) {
        throw error;
    }
}

export async function buildDockerWinter24() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const docker = (await readFile(join('.', 'Dockerfile'))).toString();

        await dockerBuild('pictaccio-image-service-winter24', docker, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
    } catch (error) {
        throw error;
    }
}

export async function buildDockerTest() {
    try {
        const appBuild = process.env.APP_BUILD || await getCurrentTag();
        const docker = (await readFile(join('.', 'Dockerfile'))).toString();

        await dockerBuild('pictaccio-image-service-test', docker, {
            APP_BUILD: appBuild,
            NPMRC: (await readFile(join(homedir(), '.npmrc'))).toString().replaceAll('\n', ';')
        });
    } catch (error) {
        throw error;
    }
}

/* COMMON FUNCTIONS */
/ function clean() {
    /     return gulp.src(dirs.in.dist)
        /         .pipe(gulpClean());
/ }


/* PRE COMPILE FUNCTIONS */
/* POST COMPILE FUNCTIONS */
function dockerBuild(targetName, dockerfile, variables) {
    return new Promise((resolve, reject) => {
        const docker = spawn(
            'docker',
            ['build', '-f-', '-t', targetName, '../../'],
            { stdio: ['pipe', process.stdout, process.stderr] }
        );

        if (docker && docker.stdin) {
            for (const [key, value] of Object.entries(variables)) {
                dockerfile = dockerfile.replaceAll(`<%= ${key} %>`, value);
            }
            docker.addListener('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error('Docker build failed'));
                }
            })
            docker.stdin.addListener('error', (error) => {
                reject(error);
            })
            docker.stdin.write(dockerfile);
            docker.stdin.end();
        }
    });
}

function getCurrentTag() {
    return new Promise((resolve, reject) => {
        const git = spawn('git', ['describe', '--contains', '--tags'], { stdio: ['pipe', 'pipe', 'pipe'] });
        let stdout = '';
        let stderr = '';

        if (git && git.stdout) {
            git.stderr.addListener('data', (chunk) => {
                stderr += chunk.toString();
            });
            git.stdout.addListener('data', (chunk) => {
                stdout += chunk.toString();
            });
            git.stdout.addListener('end', () => {
                if (stderr !== '') {
                    reject(new Error('Missing tag on current branch'));
                } else {
                    resolve(stdout);
                }
            });
        }
    });
}

/* EXPORTS */
