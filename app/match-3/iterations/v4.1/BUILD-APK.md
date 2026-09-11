# BUILD-APK — Match-3 América v4.1

```bash
cd app/match-3/iterations/v4.1
npm install && npm run smoke && npx tsc --noEmit
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
npm run apk
```

Package: `com.wika.match3` · versionName `4.1.0` · versionCode `6`  
Copia: `final/match-3-america-v4.1-release.apk`
