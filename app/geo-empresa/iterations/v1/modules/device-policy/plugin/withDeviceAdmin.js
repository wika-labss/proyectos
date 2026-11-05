const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const RECEIVER = 'com.wika.geoempresa.devicepolicy.GeoDeviceAdminReceiver';

function withDeviceAdmin(config) {
  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.receiver = app.receiver || [];
    const exists = app.receiver.some(
      (item) => item.$['android:name'] === RECEIVER || item.$['android:name'] === '.GeoDeviceAdminReceiver',
    );
    if (!exists) {
      app.receiver.push({
        $: {
          'android:name': RECEIVER,
          'android:exported': 'true',
          'android:permission': 'android.permission.BIND_DEVICE_ADMIN',
        },
        'meta-data': [
          {
            $: {
              'android:name': 'android.app.device_admin',
              'android:resource': '@xml/geo_device_admin',
            },
          },
        ],
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.app.action.DEVICE_ADMIN_ENABLED' } }],
          },
        ],
      });
    }
    return mod;
  });

  config = withDangerousMod(config, [
    'android',
    async (mod) => {
      const xmlDir = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      fs.mkdirSync(xmlDir, { recursive: true });
      const src = path.join(__dirname, '../android/src/main/res/xml/geo_device_admin.xml');
      fs.copyFileSync(src, path.join(xmlDir, 'geo_device_admin.xml'));
      return mod;
    },
  ]);

  return config;
}

module.exports = withDeviceAdmin;
