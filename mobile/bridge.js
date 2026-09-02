/**
 * WebView'a içerik yüklenmeden ÖNCE enjekte edilen köprü.
 *
 * Neden gerekli: oyun bir web sayfası olarak yazıldı ve üç tarayıcı API'sine
 * dayanıyor; WKWebView'da üçü de ya yok ya güvenilmez.
 *
 *   localStorage  → WKWebView'da satır içi yüklenen belgede kalıcılığı
 *                   garanti değil. 100 günlük kampanyayı kaybetmek en kötü
 *                   hata olurdu; bu yüzden RİSKİ TEST ETMEK YERİNE TASARIMLA
 *                   KALDIRIYORUZ: senkron bir bellek içi shim, native
 *                   AsyncStorage'dan tohumlanır, her yazma native'e aynalanır.
 *   navigator.share → WebView'da yok. Yedek yol olan a[download] da çalışmaz,
 *                   yani paylaşım kartı tamamen kırılırdı. expo-sharing'e köprü.
 *   navigator.vibrate → iOS'ta hiç yoktu. expo-haptics'e köprü.
 *
 * Bu dosya bir JS *dizesi* üretir; React tarafında değil, sayfa bağlamında koşar.
 */

/** @param {{store: Record<string,string>}} seed */
export function makeBridge(seed) {
  const seedJson = JSON.stringify(seed.store || {});

  return `(function(){
  if (window.__secimBridge) return;
  window.__secimBridge = true;

  var post = function(msg){
    try { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch(e){}
  };

  /* ---- 1. Kayıt: senkron shim, native'den tohumlanmış ---- */
  var mem = ${seedJson};
  var shim = {
    getItem: function(k){ return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function(k, v){ mem[k] = String(v); post({type:'store', key:String(k), value:String(v)}); },
    removeItem: function(k){ delete mem[k]; post({type:'store', key:String(k), value:null}); },
    clear: function(){ for (var k in mem){ post({type:'store', key:k, value:null}); } mem = {}; },
    key: function(i){ return Object.keys(mem)[i] === undefined ? null : Object.keys(mem)[i]; }
  };
  Object.defineProperty(shim, 'length', { get: function(){ return Object.keys(mem).length; } });

  try {
    Object.defineProperty(window, 'localStorage', { value: shim, configurable: true });
  } catch (e) {
    /* Tanımlanamıyorsa yerleşik olanı tohumla ve yazmaları aynala —
       her iki yolda da kayıt native tarafta tutulur. */
    try {
      var native = window.localStorage;
      for (var k in mem) { native.setItem(k, mem[k]); }
      var origSet = native.setItem.bind(native);
      var origDel = native.removeItem.bind(native);
      native.setItem = function(kk, vv){ origSet(kk, vv); post({type:'store', key:String(kk), value:String(vv)}); };
      native.removeItem = function(kk){ origDel(kk); post({type:'store', key:String(kk), value:null}); };
    } catch (e2) {}
  }

  /* ---- 2. Paylaşım: Blob → base64 → expo-sharing ---- */
  navigator.canShare = function(){ return true; };
  navigator.share = function(data){
    data = data || {};
    var file = data.files && data.files[0];
    if (!file) { post({type:'share', text:data.text || ''}); return Promise.resolve(); }
    return new Promise(function(resolve){
      var fr = new FileReader();
      fr.onloadend = function(){
        var s = String(fr.result || '');
        var comma = s.indexOf(',');
        post({type:'share', text:data.text || '', b64: comma >= 0 ? s.slice(comma+1) : ''});
        resolve();
      };
      fr.onerror = function(){ post({type:'share', text:data.text || ''}); resolve(); };
      fr.readAsDataURL(file);
    });
  };

  /* ---- 3. Haptik ---- */
  navigator.vibrate = function(pattern){
    var strong = Array.isArray(pattern) || Number(pattern) >= 15;
    post({type:'haptic', strong: strong});
    return true;
  };

  /* ---- 4. Hata görünürlüğü: sessiz beyaz ekran yerine native tarafa bildir ---- */
  window.addEventListener('error', function(ev){
    post({type:'weberror', message: String(ev.message || ''), src: String(ev.filename || ''), line: ev.lineno || 0});
  });

  post({type:'ready'});
})(); true;`;
}
