// 選んだスタイルのフォントだけを読み込む（フォントはアプリに同梱、外部サービスには接続しない）。
import type { StyleId } from '../state/types';

const loaders: Record<StyleId, () => Promise<unknown>> = {
  pop: () => Promise.all([import('@fontsource/zen-maru-gothic/400.css'), import('@fontsource/zen-maru-gothic/700.css')]),
  chic: () =>
    Promise.all([
      import('@fontsource/noto-sans-jp/400.css'),
      import('@fontsource/noto-sans-jp/700.css'),
      import('@fontsource/noto-serif-jp/600.css'),
    ]),
  game: () => Promise.all([import('@fontsource/m-plus-rounded-1c/500.css'), import('@fontsource/m-plus-rounded-1c/800.css')]),
};

const loaded = new Set<StyleId>();

export function loadStyleFonts(style: StyleId): void {
  if (loaded.has(style)) return;
  loaded.add(style);
  // 読み込みに失敗しても、システムフォントで表示を続ける
  loaders[style]().catch(() => loaded.delete(style));
}
