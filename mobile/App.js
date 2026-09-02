import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as SplashScreen from 'expo-splash-screen';
import { File, Paths } from 'expo-file-system';

import { GAME_HTML } from './game-html';
import { makeBridge } from './bridge';

/* Oyunun kalıcı tuttuğu iki anahtar (index.html: SAVE_KEY, AUDIO_KEY).
   Tohumlama bunlarla sınırlı — WebView'a gereksiz veri taşımıyoruz. */
const KEYS = ['secim2027_save_v4', 'secim2027_audio'];

/* Sayfanın kendi origin'i olsun: göreli hiçbir istek yok ama tanımlı bir
   origin, WKWebView'ın depolama ve güvenlik davranışını öngörülebilir kılar. */
const BASE_URL = 'https://secim2027.local/';

const BG = '#0a0b0d'; // oyunun --surface-0 token'ı; açılışta beyaz parlama olmasın

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [seed, setSeed] = useState(null);
  const webRef = useRef(null);

  // Kayıt native'den okunmadan WebView'ı KURMUYORUZ; yoksa oyun boş
  // depolamayla açılır ve "Devam Et" görünmez.
  useEffect(() => {
    let alive = true;
    (async () => {
      const store = {};
      try {
        const pairs = await AsyncStorage.multiGet(KEYS);
        for (const [k, v] of pairs) if (v != null) store[k] = v;
      } catch (e) {
        // depolama okunamadıysa oyun yeni kampanyayla açılır — çökmez
      }
      if (alive) setSeed({ store });
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onMessage = useCallback(async (event) => {
    let msg;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (msg.type === 'store') {
      try {
        if (msg.value === null) await AsyncStorage.removeItem(msg.key);
        else await AsyncStorage.setItem(msg.key, msg.value);
      } catch (e) {}
      return;
    }

    if (msg.type === 'haptic') {
      try {
        await Haptics.impactAsync(
          msg.strong
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light
        );
      } catch (e) {}
      return;
    }

    if (msg.type === 'share') {
      try {
        if (!msg.b64) return;
        const file = new File(Paths.cache, 'secim2027-sonuc.png');
        try {
          if (file.exists) file.delete();
        } catch (e) {}
        file.create();
        file.write(msg.b64, { encoding: 'base64' });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'image/png',
            dialogTitle: 'Seçim 2027 — Sonuç',
            UTI: 'public.png',
          });
        }
      } catch (e) {}
      return;
    }

    if (msg.type === 'weberror') {
      // Beyaz ekran yerine en azından cihaz günlüğünde iz bıraksın.
      console.warn('[oyun] ' + msg.message + ' @ ' + msg.src + ':' + msg.line);
    }
  }, []);

  const onLoadEnd = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!seed) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={BG} />
        <ActivityIndicator color="#d2a83c" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={BG} />
      <WebView
        ref={webRef}
        style={styles.web}
        containerStyle={styles.web}
        source={{ html: GAME_HTML, baseUrl: BASE_URL }}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={makeBridge(seed)}
        onMessage={onMessage}
        onLoadEnd={onLoadEnd}
        // Oyun kendi kaydırmasını yönetiyor (.screen{overflow-y:auto});
        // WebView'ın kendi kaydırması araya girmesin.
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        // WebAudio kullanıcı hareketiyle başlıyor; sessiz kalmasın.
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        // Oyun tamamen çevrimdışı; hiçbir dış istek yok.
        cacheEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        // Metin seçimi/uzun basma menüsü oyun hissini bozuyor.
        {...(Platform.OS === 'ios' ? { allowsLinkPreview: false } : {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, alignItems: 'stretch', justifyContent: 'center' },
  web: { flex: 1, backgroundColor: BG },
});
