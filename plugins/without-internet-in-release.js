const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

// Release builds have no internet access. Debug builds keep it so the
// development build can load JavaScript from Metro.
const RELEASE_MANIFEST = `<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools">
  <uses-permission android:name="android.permission.INTERNET" tools:node="remove"/>
</manifest>
`;

module.exports = function withoutInternetInRelease(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const dir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'release');
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(path.join(dir, 'AndroidManifest.xml'), RELEASE_MANIFEST);
      return config;
    },
  ]);
};
