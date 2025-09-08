"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromiseTimeout = createPromiseTimeout;
exports.formatPEMString = formatPEMString;
exports.getApiServerVersion = getApiServerVersion;
exports.getCurrentBranchName = getCurrentBranchName;
exports.getCurrentGitTag = getCurrentGitTag;
const node_child_process_1 = require("node:child_process");
function createPromiseTimeout(msTimeout, promise) {
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('timeout');
        }, msTimeout);
    });
    return Promise.race([
        timeoutPromise,
        promise
    ]);
}
function formatPEMString(certificate) {
    if (typeof certificate === 'string' && !certificate.includes('\n')) {
        return certificate.replace(/\\n/g, '\n');
    }
    return certificate;
}
async function getApiServerVersion() {
    if (process.env.APP_BUILD !== undefined) {
        return process.env.APP_BUILD;
    }
    const gitTag = await getCurrentGitTag();
    if (gitTag !== '') {
        return gitTag;
    }
    return await getCurrentBranchName();
}
function getCurrentBranchName() {
    return new Promise((resolve, reject) => {
        const git = (0, node_child_process_1.spawn)('git', ['describe', '--contains', '--all', 'HEAD'], { stdio: ['pipe', 'pipe', 'pipe'] });
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
                    resolve('');
                }
                else {
                    resolve(stdout.endsWith('\n')
                        ? stdout.slice(0, -1)
                        : stdout);
                }
            });
        }
    });
}
function getCurrentGitTag() {
    return new Promise((resolve, reject) => {
        const git = (0, node_child_process_1.spawn)('git', ['describe', '--contains', '--tags'], { stdio: ['pipe', 'pipe', 'pipe'] });
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
                    resolve('');
                }
                else {
                    resolve(stdout.endsWith('\n')
                        ? stdout.slice(0, -1)
                        : stdout);
                }
            });
        }
    });
}
//# sourceMappingURL=utils.js.map