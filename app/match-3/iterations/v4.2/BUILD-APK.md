# BUILD-APK — Match-3 América v4.2

```bash
cd app/match-3/iterations/v4.2
npm install && npm run smoke && npx tsc --noEmit
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
npm run apk
```

Package: `com.wika.match3` · versionName `4.2.0` · versionCode `7`  
Copia: `final/match-3-america-v4.2-release.apk`
