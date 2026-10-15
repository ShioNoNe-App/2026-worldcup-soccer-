import { useEffect } from 'react';
import { useApp } from './state/AppContext';
import type { Screen } from './state/types';
import { Home, ThemeScreen, TopicScreen } from './screens/Explore';
import { MapScreen } from './screens/MapScreen';
import { ProfileForm, Reading, StylePicker, ThemePicker, Welcome } from './screens/Onboarding';
import { About, Settings } from './screens/Settings';
import { BottomNav, Toasts } from './ui/common';

const NEEDS_CHART: Screen[] = ['reading', 'themes', 'home', 'theme', 'topic', 'map'];
const WITH_NAV: Screen[] = ['home', 'theme', 'topic', 'map', 'settings'];

export function App() {
  const { state, chart } = useApp();

  // 保存データと画面の整合性をとる（例: 生年月日がないのに結果画面にいる）
  let screen = state.screen;
  if (NEEDS_CHART.includes(screen) && !chart) screen = state.profile ? 'profile' : 'welcome';
  if ((screen === 'theme' && !state.activeTheme) || (screen === 'topic' && !state.activeTopic)) screen = 'home';
  if (screen === 'settings' && !state.onboarded) screen = 'welcome';

  useEffect(() => {
    document.title = 'じぶんめくり｜占いで、じぶんをめくる';
  }, []);

  const accent = screen === 'theme' || screen === 'topic' ? (state.activeTheme ?? undefined) : undefined;
  const showNav = state.onboarded && (WITH_NAV.includes(screen) || (screen === 'themes' && state.onboarded) || screen === 'about');

  return (
    <div className="app" data-accent={accent} data-screen={screen}>
      <a href="#content" className="sr-only">
        本文へ移動
      </a>
      <div id="content">
        {screen === 'welcome' && <Welcome />}
        {screen === 'style' && <StylePicker />}
        {screen === 'profile' && <ProfileForm />}
        {screen === 'reading' && <Reading />}
        {screen === 'themes' && <ThemePicker />}
        {screen === 'home' && <Home />}
        {screen === 'theme' && <ThemeScreen />}
        {screen === 'topic' && <TopicScreen />}
        {screen === 'map' && <MapScreen />}
        {screen === 'settings' && <Settings />}
        {screen === 'about' && <About />}
      </div>
      {showNav && <BottomNav />}
      <Toasts />
    </div>
  );
}
