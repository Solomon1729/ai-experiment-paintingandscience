// aiphoto-client.js — 親ページ側の補助。<iframe> に埋め込んだ index.html を postMessage で操作する。
// 使い方は README コメントの末尾を参照。
export class AIPhoto {
  /** @param {HTMLIFrameElement} iframe  @param {string} origin 例: 'https://user.github.io' */
  constructor(iframe, origin) {
    this.f = iframe; this.origin = origin; this.n = 0; this.p = new Map();
    addEventListener('message', (e) => {
      if (e.source !== this.f.contentWindow || e.origin !== this.origin) return;
      const m = e.data || {}, r = this.p.get(m.id);
      if (!r) return;
      this.p.delete(m.id);
      if (m.type === 'aiphoto:error') r.rej(new Error(m.message)); else r.res(m);
    });
  }
  send(type, data = {}) {
    return new Promise((res, rej) => {
      const id = ++this.n; this.p.set(id, { res, rej });
      this.f.contentWindow.postMessage({ type, id, ...data }, this.origin);
    });
  }
  /** iframe の読み込み後に呼ぶ。応答があるまで繰り返し確認する。 */
  async ready(timeoutMs = 60000) {
    const t0 = Date.now();
    for (;;) {
      try {
        return await Promise.race([this.send('aiphoto:ping'), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000))]);
      } catch (e) {
        if (Date.now() - t0 > timeoutMs) throw new Error('埋め込み先から応答がありません');
      }
    }
  }
  /** モデルを取得して読み込む(初回のみ通信。以降は端末に保存されたものを使う)。models: ['upscale', 'face'] */
  prepare(models) { return this.send('aiphoto:prepare', { models }); }
  /** 画像を渡す。image は Blob か ArrayBuffer。maxSide は 512 / 768 / 1024 / 1536 / 99999(元の大きさ)。 */
  load(image, maxSide) { return this.send('aiphoto:load', { image, maxSide }); }
  /** op: 'upscale'(4倍拡大) / 'face'(顔の自動検出と修復) / 'adjust'(色の調整。params は b,c,s,w,g を -100〜100)。
      結果は { blob(PNG), width, height } */
  run(op, params) { return this.send('aiphoto:run', { op, params }); }
}

/* 使用例(親ページ):
   <iframe id="ai" src="https://ユーザー名.github.io/リポジトリ名/index.html" style="width:1px;height:1px;border:0;position:absolute;left:-9999px"></iframe>
   <script type="module">
     import { AIPhoto } from './aiphoto-client.js';
     const f = document.getElementById('ai');
     f.addEventListener('load', async () => {
       const ai = new AIPhoto(f, 'https://ユーザー名.github.io');
       await ai.ready();
       await ai.prepare(['upscale']);            // 初回のみダウンロード
       await ai.load(fileBlob, 1024);
       const { blob } = await ai.run('upscale'); // 4倍拡大した PNG
     });
   </script>
*/
