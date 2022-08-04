import os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
const actualExec = promisify(exec);

export default async function (pkgName, ws) {
  try {
    const { stdout, stderr } = await actualExec(
      `adb shell dumpsys package ${pkgName}`,
      { maxBuffer: 10240 * 1024 }
    );
    const dumpSysOut = stdout || stderr;
    if (!dumpSysOut.match(/versionName=([^=]+)/)) {
      ws.send(
        JSON.stringify({
          event: 'error',
          error:
            "The app you selected is not installed on your device. It's needed for rooted ReVanced."
        })
      );
      return null;
    }
    return dumpSysOut
      .match(/versionName=([^=]+)/)[1]
      .replace(`${os.EOL}    `, '')
      .match(/[\d]+(\.\d+)+/g)[0];
  } catch (e) {
    return null;
  }
}
