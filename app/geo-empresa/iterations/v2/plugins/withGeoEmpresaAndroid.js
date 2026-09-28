const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require('@expo/config-plugins');

const PACKAGE = 'com.wika.geoempresa';
const PIN = '1312';

function copyNativeSources(projectRoot) {
  const androidAppPath = path.join(projectRoot, 'android', 'app', 'src', 'main');
  const javaDir = path.join(androidAppPath, 'java', ...PACKAGE.split('.'));
  const resXmlDir = path.join(androidAppPath, 'res', 'xml');

  fs.mkdirSync(javaDir, { recursive: true });
  fs.mkdirSync(resXmlDir, { recursive: true });

  const templatesDir = path.join(projectRoot, 'plugins', 'android-templates');
  for (const file of fs.readdirSync(templatesDir)) {
    if (file.endsWith('.kt')) {
      fs.copyFileSync(path.join(templatesDir, file), path.join(javaDir, file));
    }
    if (file.endsWith('.xml')) {
      fs.copyFileSync(path.join(templatesDir, file), path.join(resXmlDir, file));
    }
  }
}

function patchMainApplication(projectRoot) {
  const mainAppPath = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'java',
    ...PACKAGE.split('.'),
    'MainApplication.kt',
  );

  if (!fs.existsSync(mainAppPath)) {
    console.warn('[withGeoEmpresaAndroid] MainApplication.kt not found');
    return;
  }

  let content = fs.readFileSync(mainAppPath, 'utf8');
      if (!content.includes('GeoEmpresaNativePackage')) {
    content = content.replace(
      'PackageList(this).packages.apply {',
      'PackageList(this).packages.apply {\n              add(GeoEmpresaNativePackage())',
    );
  }
  if (!content.includes('GeoLockController.ensurePolicies')) {
    content = content.replace(
      'super.onCreate()',
      'super.onCreate()\n    GeoLockController.ensurePolicies(this)\n    GeoLockService.start(this)',
    );
  }
  fs.writeFileSync(mainAppPath, content);
}

const withGeoEmpresaAndroid = (config) => {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      application,
      'geo_empresa_default_pin',
      PIN,
    );

    if (!application.receiver) {
      application.receiver = [];
    }

    const receivers = [
      {
        $: {
          'android:name': '.GeoDeviceAdminReceiver',
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
      },
      {
        $: {
          'android:name': '.GeoBootReceiver',
          'android:exported': 'true',
          'android:enabled': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } }],
          },
        ],
      },
      {
        $: {
          'android:name': '.GeoAirplaneReceiver',
          'android:exported': 'true',
          'android:enabled': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.AIRPLANE_MODE' } }],
          },
        ],
      },
    ];

    for (const receiver of receivers) {
      const exists = application.receiver.some(
        (item) => item.$?.['android:name'] === receiver.$['android:name'],
      );
      if (!exists) {
        application.receiver.push(receiver);
      }
    }

    if (!application.activity) {
      application.activity = [];
    }

    const lockActivity = {
      $: {
        'android:name': '.SecurityLockActivity',
        'android:exported': 'true',
        'android:launchMode': 'singleTask',
        'android:excludeFromRecents': 'true',
        'android:showOnLockScreen': 'true',
        'android:turnScreenOn': 'true',
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'com.wika.geoempresa.LOCK' } }],
          category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        },
      ],
    };

    const hasLockActivity = application.activity.some(
      (item) => item.$?.['android:name'] === lockActivity.$['android:name'],
    );
    if (!hasLockActivity) {
      application.activity.push(lockActivity);
    } else {
      const existing = application.activity.find(
        (item) => item.$?.['android:name'] === lockActivity.$['android:name'],
      );
      if (existing && existing.$) {
        existing.$['android:exported'] = 'true';
        existing['intent-filter'] = lockActivity['intent-filter'];
      }
    }

    if (!application.service) {
      application.service = [];
    }
    const lockService = {
      $: {
        'android:name': '.GeoLockService',
        'android:exported': 'false',
        'android:foregroundServiceType': 'location|specialUse',
      },
      property: [
        {
          $: {
            'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
            'android:value': 'corporate device kiosk watchdog',
          },
        },
      ],
    };
    const hasService = application.service.some(
      (item) => item.$?.['android:name'] === lockService.$['android:name'],
    );
    if (!hasService) {
      application.service.push(lockService);
    }

    return config;
  });

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      copyNativeSources(config.modRequest.projectRoot);
      patchMainApplication(config.modRequest.projectRoot);
      return config;
    },
  ]);

  return config;
};

module.exports = withGeoEmpresaAndroid;
