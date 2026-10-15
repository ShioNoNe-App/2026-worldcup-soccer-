import { expect, test, type Page } from '@playwright/test';

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'ページが横にはみ出していない').toBeLessThanOrEqual(0);
}

async function onboard(page: Page, opts: { style?: 'pop' | 'chic' | 'game' | 'skip'; themes?: string[] } = {}) {
  await page.goto('/');
  await page.getByRole('button', { name: '占いをはじめる' }).click();
  if (!opts.style || opts.style === 'skip') {
    await page.getByRole('button', { name: /^スキップ/ }).click();
  } else {
    await page.getByTestId(`style-${opts.style}`).click();
    await page.getByRole('button', { name: /^「.*」ではじめる$/ }).click();
  }
  await page.selectOption('#birth-y', '1995');
  await page.selectOption('#birth-m', '8');
  await page.selectOption('#birth-d', '17');
  await page.getByRole('button', { name: '命式をひらく' }).click();
  await expect(page.getByText('あなたの命式')).toBeVisible();
  await page.getByRole('button', { name: 'まとめて全部めくる' }).click();
  await page.getByRole('button', { name: /テーマをえらぶ/ }).click();
  for (const t of opts.themes ?? ['love']) await page.getByTestId(`theme-${t}`).click();
  await page.getByRole('button', { name: /このテーマでめくる/ }).click();
}

/** 選択肢を選んで「次へ」で確定する */
async function answer(page: Page, label: string | RegExp) {
  await page.getByRole('radio', { name: label }).click();
  await page.getByTestId('confirm-answer').click();
}

async function answerUntilResult(page: Page, pick: (labels: string[]) => number = () => 0) {
  for (let i = 0; i < 10; i++) {
    if (await page.getByTestId('topic-result').isVisible()) return;
    const q = page.getByTestId('question');
    await expect(q).toBeVisible();
    const options = page.locator('.options .option');
    const labels = await options.allInnerTexts();
    await options.nth(pick(labels)).click();
    await page.getByTestId('confirm-answer').click();
  }
  await expect(page.getByTestId('topic-result')).toBeVisible();
}

test('A: 初回ユーザーが結果とテーマ選択までたどり着ける', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ねえ、あなたってどんな人？' })).toBeVisible();
  await noHorizontalScroll(page);
  await page.getByRole('button', { name: '占いをはじめる' }).click();
  await expect(page.getByRole('radiogroup', { name: 'UIスタイル' })).toBeVisible();
  await noHorizontalScroll(page);
  await page.getByTestId('style-pop').click();
  await page.getByRole('button', { name: '「ふんわりポップ」ではじめる' }).click();

  // 未入力ではエラー
  await page.getByRole('button', { name: '命式をひらく' }).click();
  await expect(page.getByRole('alert')).toContainText('生年月日を選んでください');

  await page.selectOption('#birth-y', '2000');
  await page.selectOption('#birth-m', '1');
  await page.selectOption('#birth-d', '1');
  await page.getByLabel('生まれた時刻がわかる（任意）').check();
  await page.getByLabel('生まれた時刻', { exact: true }).fill('12:00');
  await page.getByRole('button', { name: '命式をひらく' }).click();

  // 2000-01-01 12:00 → 己卯 丙子 戊午 戊午
  await expect(page.getByLabel('日柱 戊午')).toBeVisible();
  await expect(page.getByLabel('年柱 己卯')).toBeVisible();
  await expect(page.getByLabel('月柱 丙子')).toBeVisible();
  await expect(page.getByLabel('時柱 戊午')).toBeVisible();

  // 1枚ずつめくれる
  await page.getByRole('button', { name: /めくる（1 \/ \d+）/ }).click();
  await expect(page.getByRole('heading', { name: 'どっしり構える山タイプ' })).toBeVisible();
  await page.getByRole('button', { name: 'まとめて全部めくる' }).click();
  await answer(page, 'すごくある！');
  await expect(page.getByText(/キーワード：/)).toBeVisible();
  await page.getByRole('button', { name: '次に知りたいテーマをえらぶ' }).click();

  await expect(page.getByRole('heading', { name: '次は、何を知りたい？' })).toBeVisible();
  const go = page.getByRole('button', { name: 'テーマを選んでください' });
  await expect(go).toBeDisabled();
  await page.getByTestId('theme-love').click();
  await page.getByTestId('theme-work').click();
  await expect(page.getByTestId('theme-love')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'このテーマでめくる（2）' }).click();
  await expect(page.getByText('えらんだテーマ')).toBeVisible();
  await noHorizontalScroll(page);
});

test('B: スタイルを切り替えられ、再読み込み後も保持される', async ({ page }) => {
  await onboard(page, { style: 'pop' });
  await expect(page.locator('html')).toHaveAttribute('data-style', 'pop');
  const popFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  await page.getByRole('button', { name: '設定' }).click();
  await page.getByTestId('style-chic').click();
  await expect(page.locator('html')).toHaveAttribute('data-style', 'chic');
  await expect(page.getByTestId('style-chic')).toHaveAttribute('aria-checked', 'true');
  // 色だけでなく、フォント・角丸も変わる
  const chicFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(chicFont).not.toBe(popFont);
  const radius = await page.locator('.card').first().evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
  expect(radius).toBe('6px');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-style', 'chic');
  await expect(page.getByRole('heading', { name: '設定' }).or(page.getByText('UIスタイル'))).toBeVisible();
});

test('C: 恋愛を選ぶと恋愛の質問が出て、回答で次の質問が変わる', async ({ page }) => {
  await onboard(page, { themes: ['love'] });
  await expect(page.getByRole('heading', { name: '気になるところだけ答える' })).toBeVisible();
  await page.getByRole('button', { name: /片思い中/ }).click();
  await expect(page.getByTestId('question')).toHaveText('好きな人との、今の距離は？');
  await answer(page, 'まだ遠くから見ている');
  await expect(page.getByTestId('question')).toHaveText('話すきっかけ、どう作れそう？');
  // キャラクターが回答に反応する
  await expect(page.locator('.bubble')).toHaveText('見ているだけでドキドキするやつだ。');
  // 特性が具体化する回答では、キーワードが表示される
  await answer(page, '共通の話題を探してみたい');
  await expect(page.getByTestId('answer-feedback')).toContainText(/見えてきた：|発見カード/);

  // 最後まで答えると、状況の回答に応じた結果が出る。別の回答なら別の質問へ分岐する
  await answerUntilResult(page);
  await expect(page.getByTestId('topic-result')).toContainText('あいさつ');
  await page.getByRole('button', { name: '最初から答えなおす' }).click();
  await answer(page, 'よく話す・友達として仲がいい');
  await expect(page.getByTestId('question')).toHaveText('あなたの好意、相手に伝わっていると思う？');
});

test('D: 仕事を選ぶと仕事の質問と結果が出て、恋愛の質問が混ざらない', async ({ page }) => {
  await onboard(page, { themes: ['work'] });
  await page.getByRole('button', { name: /私の強みって/ }).click();
  const loveWords = /恋|好きな人|デート|恋人|結婚|片思い/;
  for (let i = 0; i < 6; i++) {
    if (await page.getByTestId('topic-result').isVisible()) break;
    await expect(page.getByTestId('question')).not.toHaveText(loveWords);
    await page.locator('.options .option').first().click();
    await page.getByTestId('confirm-answer').click();
  }
  const result = page.getByTestId('topic-result');
  await expect(result).toContainText('自分の強みの結果');
  await expect(result).toContainText('強み');
  await expect(result).toContainText('注意点');
});

test('E: 途中で再読み込みしても続きから再開できる', async ({ page }) => {
  await onboard(page, { themes: ['love'] });
  await page.getByRole('button', { name: /片思い中/ }).click();
  await answer(page, 'たまに話すくらい');
  await expect(page.getByTestId('question')).toHaveText('あなたの好意、相手に伝わっていると思う？');
  await page.reload();
  await expect(page.getByTestId('question')).toHaveText('あなたの好意、相手に伝わっていると思う？');
  // ホームには「つづきから」が出る
  await page.getByRole('button', { name: 'めくる', exact: true }).click();
  await expect(page.getByTestId('resume')).toHaveText('「片思い」をつづける');
});

test('F: 「わからない」「どれも違う」「スキップ」でも先に進める', async ({ page }) => {
  await onboard(page, { themes: ['love', 'work'] });
  await page.getByRole('button', { name: /恋愛・結婚・相性/ }).click();
  await page.getByRole('button', { name: /どんな恋をするタイプ/ }).click();
  await answerUntilResult(page, (labels) => {
    const i = labels.findIndex((l) => /わからない|どれも違う|スキップ|答えたくない|全然ちがう/.test(l));
    return i >= 0 ? i : labels.length - 1;
  });
  await expect(page.getByTestId('topic-result')).toBeVisible();

  await page.getByRole('button', { name: /「恋愛」のテーマにもどる/ }).click();
  await page.getByRole('button', { name: /私の結婚観/ }).click();
  await answer(page, '答えたくない');
  await expect(page.getByTestId('question')).toBeVisible();
});

test('G: 相性診断は相手の生年月日なしでも、ありでも使える', async ({ page }) => {
  await onboard(page, { themes: ['love'] });
  await page.getByRole('button', { name: /あの人との相性/ }).click();
  await page.getByRole('button', { name: 'わからない・入力しないで進む' }).click();
  await answerUntilResult(page);
  await expect(page.getByTestId('compat-result')).toHaveCount(0);

  await page.getByRole('button', { name: '最初から答えなおす' }).click();
  await page.reload();
  await page.selectOption('#partner-y', '1999');
  await page.selectOption('#partner-m', '12');
  await page.selectOption('#partner-d', '27');
  await page.getByRole('button', { name: '相性をみる' }).click();
  const compat = page.getByTestId('compat-result');
  await expect(compat).toContainText('お相手の日柱「癸丑」');
  // 相手の生年月日そのものは保存しない
  const stored = await page.evaluate(() => localStorage.getItem('jibun-mekuri:v1') ?? '');
  expect(stored).not.toContain('1999');
  expect(stored).toContain('partnerDay');
});

test('H: 小さな画面でもはみ出さず、ボタンが押しやすい', async ({ page }) => {
  await onboard(page, { themes: ['love', 'work', 'relations', 'self', 'life'] });
  for (const go of [
    async () => page.getByRole('button', { name: /恋愛・結婚・相性/ }).click(),
    async () => page.getByRole('button', { name: /片思い中/ }).click(),
    async () => page.getByRole('button', { name: 'じぶんマップ' }).click(),
    async () => page.getByRole('button', { name: '設定' }).click(),
  ]) {
    await go();
    await noHorizontalScroll(page);
  }
  const sizes = await page.locator('.btn:visible, .option:visible, .nav-btn:visible').evaluateAll((els) =>
    els.map((e) => e.getBoundingClientRect().height),
  );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
});

test('I: 保存データを削除して新しく始められる', async ({ page }) => {
  await onboard(page, { style: 'game' });
  await page.getByRole('button', { name: '設定' }).click();
  await page.getByRole('button', { name: '保存データをすべて削除' }).click();
  await page.getByRole('dialog').getByRole('button', { name: '削除する' }).click();
  await expect(page.getByRole('heading', { name: 'ねえ、あなたってどんな人？' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('jibun-mekuri:v1'))).toBeNull();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-style', 'pop');
  await page.getByRole('button', { name: '占いをはじめる' }).click();
  await expect(page.getByRole('radiogroup', { name: 'UIスタイル' })).toBeVisible();
});

test('動きを減らす設定でも全機能が使える', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await onboard(page, { themes: ['life'] });
  await page.getByRole('button', { name: /これからの運勢は/ }).click();
  await expect(page.getByText(/年（.+）/).first()).toBeVisible();
  await answerUntilResult(page);
  const dur = await page.locator('.anim-flip').first().evaluate((el) => getComputedStyle(el).animationDuration);
  expect(parseFloat(dur)).toBeLessThan(0.01);
});

test('キーボードだけでスタイルを選べる', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '占いをはじめる' }).click();
  await page.getByTestId('style-pop').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByTestId('style-chic')).toBeFocused();
  await expect(page.getByTestId('style-chic')).toHaveAttribute('aria-checked', 'true');
});

test('①: 答えは「次へ」を押すまで確定せず、選び直し・ひとつ前に戻れる', async ({ page }) => {
  await onboard(page, { themes: ['love'] });
  await page.getByRole('button', { name: /片思い中/ }).click();
  const confirm = page.getByTestId('confirm-answer');
  await expect(confirm).toBeDisabled();
  await page.getByRole('radio', { name: 'まだ遠くから見ている' }).click();
  // 選んだだけでは進まない
  await expect(page.getByTestId('question')).toHaveText('好きな人との、今の距離は？');
  await page.getByRole('radio', { name: 'たまに話すくらい' }).click();
  await expect(page.getByRole('radio', { name: 'たまに話すくらい' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('radio', { name: 'まだ遠くから見ている' })).toHaveAttribute('aria-checked', 'false');
  await confirm.click();
  await expect(page.getByTestId('question')).toHaveText('あなたの好意、相手に伝わっていると思う？');
  // ひとつ前に戻ると、前の答えが選ばれた状態で修正できる
  await page.getByRole('button', { name: /ひとつ前へ/ }).click();
  await expect(page.getByTestId('question')).toHaveText('好きな人との、今の距離は？');
  await expect(page.getByRole('radio', { name: 'たまに話すくらい' })).toHaveAttribute('aria-checked', 'true');
  await answer(page, 'まだ遠くから見ている');
  await expect(page.getByTestId('question')).toHaveText('話すきっかけ、どう作れそう？');
  // 結果画面からも最後の回答を直せる
  await answerUntilResult(page);
  await page.getByTestId('fix-last').click();
  await expect(page.getByTestId('question-card')).toBeVisible();
});

test('②: 残りの質問数がひと目でわかる', async ({ page }) => {
  await onboard(page, { themes: ['work'] });
  await page.getByRole('button', { name: /私の強みって/ }).click();
  const badge = page.getByTestId('remaining');
  await expect(badge).toContainText(/あと\d+問で結果だよ/);
  await expect(badge).toContainText('1問目');
  const first = await badge.innerText();
  await page.locator('.options .option').first().click();
  await page.getByTestId('confirm-answer').click();
  await expect(badge).toContainText('2問目');
  expect(await badge.innerText()).not.toBe(first);
  await answerUntilResult(page);
});

test('③: 選んだテーマをホームから編集できる', async ({ page }) => {
  await onboard(page, { themes: ['love', 'work'] });
  await page.getByTestId('edit-themes').click();
  await expect(page.getByRole('heading', { name: '見たいテーマを選びなおそう' })).toBeVisible();
  await page.getByTestId('theme-work').click();
  await page.getByTestId('theme-self').click();
  await page.getByTestId('themes-confirm').click();
  const list = page.locator('.topic-list');
  await expect(list).toContainText('自分の性格・本当の自分');
  await expect(list).not.toContainText('仕事・才能・キャリア');
});

test('④: 右上のボタンでいつでも英語と日本語を切り替えられる', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByTestId('lang-toggle');
  await expect(toggle).toHaveText(/English/);
  await toggle.click();
  await expect(page.getByRole('heading', { name: 'Hey, what kind of person are you?' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Start my reading' }).click();
  await page.getByTestId('style-skip').click();
  await page.selectOption('#birth-y', '1995');
  await page.selectOption('#birth-m', '8');
  await page.selectOption('#birth-d', '17');
  await page.getByTestId('profile-submit').click();
  await page.getByTestId('reading-all').click();
  await page.getByTestId('to-themes').click();
  await page.getByTestId('theme-love').click();
  await page.getByTestId('themes-confirm').click();
  await page.getByRole('button', { name: /I have a crush/ }).click();
  await expect(page.getByTestId('question')).toHaveText('How close are you to the person you like right now?');
  // 途中でも日本語に戻せて、同じ質問が日本語で表示される
  await page.getByTestId('lang-toggle').click();
  await expect(page.getByTestId('question')).toHaveText('好きな人との、今の距離は？');
  await page.getByTestId('lang-toggle').click();
  await answer(page, 'We talk now and then');
  await answerUntilResult(page);
  const result = await page.getByTestId('topic-result').innerText();
  expect(result).not.toMatch(/[぀-ヿ]/);
  // 再読み込みしても英語のまま
  await page.reload();
  await expect(page.getByTestId('lang-toggle')).toHaveText(/日本語/);
});

test('⑤: タブメニューは画面上部にあり、画面下部（右下）に操作部品が重ならない', async ({ page }) => {
  await onboard(page, { themes: ['love'] });
  const nav = page.getByRole('navigation', { name: 'メインメニュー' });
  const box = await nav.boundingBox();
  const vh = page.viewportSize()!.height;
  expect(box!.y).toBeLessThan(200);
  // 画面下 72px の帯に固定配置の要素がない
  const fixedAtBottom = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('body *')).filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' || el.offsetParent === null) return false;
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.bottom > window.innerHeight - 72;
    }).length,
  );
  expect(fixedAtBottom).toBe(0);
  expect(vh).toBeGreaterThan(0);
});

test('テーマにまとめて答えると、状況に合う質問だけが続き、最後にテーマレポートが出る', async ({ page }) => {
  await onboard(page, { themes: ['love'] });
  await page.getByTestId('theme-run-start').click();
  await expect(page.getByTestId('question')).toHaveText('今の恋愛の状況に、いちばん近いのは？');
  await answer(page, '今はフリー');
  const seen: string[] = [];
  for (let i = 0; i < 40; i++) {
    if (await page.getByTestId('theme-report').isVisible()) break;
    const q = page.getByTestId('question');
    await expect(q).toBeVisible();
    seen.push(await q.innerText());
    // 途中で結果に飛ぶリンクや「もっと答える？」の確認はない
    await expect(page.getByRole('button', { name: /ここまでの結果|深掘り/ })).toHaveCount(0);
    await page.locator('.options .option').first().click();
    await page.getByTestId('confirm-answer').click();
  }
  await expect(page.getByTestId('theme-report')).toBeVisible();
  expect(seen.length).toBeGreaterThanOrEqual(8);
  expect(seen.join('\n')).not.toMatch(/好きな人との、今の距離|別れてから|今の恋人との関係/);
  await expect(page.getByTestId('theme-report')).toContainText('3つの占術から見たあなた');
  // テーマ画面に戻ると「レポートを見る」に変わっている
  await page.getByRole('button', { name: 'もどる' }).click();
  await expect(page.getByTestId('theme-run-cta')).toContainText('レポートができています');
});

test('16タイプを入力すると、じぶんマップのチャートと3つの視点に反映される', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '占いをはじめる' }).click();
  await page.getByTestId('style-skip').click();
  await page.selectOption('#birth-y', '1995');
  await page.selectOption('#birth-m', '8');
  await page.selectOption('#birth-d', '17');
  await page.selectOption('#type16', 'ENTP');
  await page.getByTestId('profile-submit').click();
  await page.getByTestId('reading-all').click();
  await expect(page.getByText('インド占星術（ジョーティシュ）')).toBeVisible();
  await expect(page.getByText(/ENTP：アイデア発明家/)).toBeVisible();
  await page.getByTestId('to-themes').click();
  await page.getByTestId('theme-self').click();
  await page.getByTestId('themes-confirm').click();
  await page.getByRole('navigation', { name: 'メインメニュー' }).getByRole('button', { name: 'じぶんマップ' }).click();
  await expect(page.getByRole('figure', { name: '性格8軸のレーダーチャート' })).toBeVisible();
  await expect(page.locator('.report-tag')).toHaveCount(3);
  await expect(page.getByTestId('manual')).toContainText('🔒');
  const lockedBefore = await page.locator('.manual-item.is-locked').count();
  // テーマに答えると取扱説明書が開いていく
  await page.getByRole('button', { name: 'めくる', exact: true }).click();
  await page.getByRole('button', { name: /自分の性格・本当の自分/ }).click();
  await page.getByTestId('theme-run-start').click();
  for (let i = 0; i < 30; i++) {
    if (await page.getByTestId('theme-report').isVisible()) break;
    await page.locator('.options .option').first().click();
    await page.getByTestId('confirm-answer').click();
  }
  await page.getByRole('navigation', { name: 'メインメニュー' }).getByRole('button', { name: 'じぶんマップ' }).click();
  expect(await page.locator('.manual-item.is-locked').count()).toBeLessThan(lockedBefore);
  await expect(page.getByTestId('understanding')).toContainText('Lv.');
});
