# Troubleshooting

Soluções para problemas comuns ao desenvolver e construir o Kyte App.

## Metro bundler travado ou cache corrompido

```bash
yarn clean:caches
# reinicie: yarn start:legacy
```

## iOS: problemas com Pods/arquitetura (Apple Silicon)

```bash
yarn podinstall:legacy
# ou: cd ios && pod install --repo-update
```

## Android: build falhando após mudanças de dependências

```bash
yarn clean:android
# e em seguida
ENVFILE=.env yarn android
```

## Erros de Reanimated/gesture-handler

- Confirme que `react-native-gesture-handler` é importado no `index.js`
- Limpe caches e reinstale pods / rebuild gradle

## OneSignal/Notificações não chegam

- Verifique `ONESIGNAL_*_APP_ID` no `.env` atual
- Cheque permissões do app no dispositivo/emulador

## Analytics (Mixpanel/AppsFlyer) sem eventos

- Garanta que as chaves em `.env*` estão corretas para o ambiente
- Em dev, alguns eventos podem estar desativados no dashboard

## Falhas de login ou 401

- Verifique se `API_GATEWAY_DEFAULT_URL` e `APIM_SUBSCRIPTION_KEY` estão válidos
- Teste conectividade de rede do emulador (`adb shell ping`)

---
