import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { databases, databaseId, COLLECTIONS, callFunction } from '@/lib/appwrite';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [settings, setSettings] = useState({
    voiceEnabled: false,
    autoReadResearch: false,
    elevenLabsApiKey: '',
    elevenLabsVoiceId: '',
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    discordEnabled: false,
    discordWebhookUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await callFunction('settings', { action: 'get' });
      if (res) {
        setSettings({
          voiceEnabled: !!res.voiceEnabled,
          autoReadResearch: !!res.autoReadResearch,
          elevenLabsApiKey: res.elevenLabsApiKey || '',
          elevenLabsVoiceId: res.elevenLabsVoiceId || '',
          telegramEnabled: !!res.telegramEnabled,
          telegramBotToken: res.telegramBotToken || '',
          telegramChatId: res.telegramChatId || '',
          discordEnabled: !!res.discordEnabled,
          discordWebhookUrl: res.discordWebhookUrl || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveSettings = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setTestResult(null);
    try {
      const res = await callFunction('settings', {
        action: 'update',
        settings: {
          userId: user.$id,
          voiceEnabled: settings.voiceEnabled,
          autoReadResearch: settings.autoReadResearch,
          elevenLabsApiKey: settings.elevenLabsApiKey,
          elevenLabsVoiceId: settings.elevenLabsVoiceId,
          telegramEnabled: settings.telegramEnabled,
          telegramBotToken: settings.telegramBotToken,
          telegramChatId: settings.telegramChatId,
          discordEnabled: settings.discordEnabled,
          discordWebhookUrl: settings.discordWebhookUrl,
        },
      });
      setTestResult({ type: 'success', message: 'Settings saved successfully' });
    } catch (err) {
      setTestResult({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }, [user, settings]);

  const testVoice = useCallback(async () => {
    if (!user || !settings.elevenLabsApiKey || !settings.elevenLabsVoiceId) {
      setTestResult({ type: 'error', message: 'API key and Voice ID required for test' });
      return;
    }
    setLoading(true);
    setTestResult(null);
    try {
      const res = await callFunction('settings', {
        action: 'test-voice',
        apiKey: settings.elevenLabsApiKey,
        voiceId: settings.elevenLabsVoiceId,
        text: 'This is a test of the Guide Trade voice feature.',
      });
      setTestResult({ type: 'success', message: `Voice test completed (${res.audioBytes || 0} bytes)` });
    } catch (err) {
      setTestResult({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [user, settings]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const clearSecret = (field) => {
    setSettings(prev => ({ ...prev, [field]: '' }));
  };

  const maskSecret = (value) => {
    if (!value) return '';
    if (value.length <= 4) return '••••';
    return '•'.repeat(4) + value.slice(-4);
  };

  const renderAccount = () => (
    <div className="settings-section">
      <div className="setting-group">
        <label>Account</label>
        <div className="account-info">
          <span>{user?.email}</span>
          <span>ID: {user?.$id}</span>
        </div>
      </div>
    </div>
  );

  const renderVoice = () => (
    <div className="settings-section">
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.voiceEnabled}
            onChange={(e) => handleInputChange('voiceEnabled', e.target.checked)}
          />
          Enable voice
        </label>
      </div>
      <div className="setting-group">
        <label>ElevenLabs API Key</label>
        {settings.elevenLabsApiKey ? (
          <div className="secret-field">
            <input type="text" value={maskSecret(settings.elevenLabsApiKey)} readOnly />
            <button onClick={() => clearSecret('elevenLabsApiKey')}>Clear</button>
          </div>
        ) : (
          <input
            type="password"
            value={settings.elevenLabsApiKey}
            onChange={(e) => handleInputChange('elevenLabsApiKey', e.target.value)}
            placeholder="sk-..."
          />
        )}
      </div>
      <div className="setting-group">
        <label>Voice ID</label>
        <input
          type="text"
          value={settings.elevenLabsVoiceId}
          onChange={(e) => handleInputChange('elevenLabsVoiceId', e.target.value)}
          placeholder="Enter Voice ID"
        />
      </div>
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.autoReadResearch}
            onChange={(e) => handleInputChange('autoReadResearch', e.target.checked)}
          />
          Auto-read research results
        </label>
      </div>
      <button className="btn-primary" onClick={testVoice} disabled={loading || !settings.elevenLabsApiKey || !settings.elevenLabsVoiceId}>
        {loading ? 'Testing...' : 'Test Voice'}
      </button>
    </div>
  );

  const renderTelegram = () => (
    <div className="settings-section">
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.telegramEnabled}
            onChange={(e) => handleInputChange('telegramEnabled', e.target.checked)}
          />
          Enable Telegram notifications
        </label>
      </div>
      {settings.telegramEnabled && (
        <>
          <div className="setting-group">
            <label>Bot Token</label>
            {settings.telegramBotToken ? (
              <div className="secret-field">
                <input type="text" value={maskSecret(settings.telegramBotToken)} readOnly />
                <button onClick={() => clearSecret('telegramBotToken')}>Clear</button>
              </div>
            ) : (
              <input
                type="password"
                value={settings.telegramBotToken}
                onChange={(e) => handleInputChange('telegramBotToken', e.target.value)}
              />
            )}
          </div>
          <div className="setting-group">
            <label>Chat ID</label>
            <input
              type="text"
              value={settings.telegramChatId}
              onChange={(e) => handleInputChange('telegramChatId', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderDiscord = () => (
    <div className="settings-section">
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.discordEnabled}
            onChange={(e) => handleInputChange('discordEnabled', e.target.checked)}
          />
          Enable Discord notifications
        </label>
      </div>
      {settings.discordEnabled && (
        <div className="setting-group">
          <label>Webhook URL</label>
          {settings.discordWebhookUrl ? (
            <div className="secret-field">
              <input type="text" value={maskSecret(settings.discordWebhookUrl)} readOnly />
              <button onClick={() => clearSecret('discordWebhookUrl')}>Clear</button>
            </div>
          ) : (
            <input
              type="password"
              value={settings.discordWebhookUrl}
              onChange={(e) => handleInputChange('discordWebhookUrl', e.target.value)}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="page settings">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <nav className="settings-nav">
        {[
          { id: 'account', label: 'Account' },
          { id: 'voice', label: 'Voice' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'about', label: 'About' },
        ].map(s => (
          <button
            key={s.id}
            className={activeSection === s.id ? 'active' : ''}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="settings-content">
        {activeSection === 'account' && renderAccount()}
        {activeSection === 'voice' && renderVoice()}
        {activeSection === 'notifications' && (
          <>
            {renderTelegram()}
            {renderDiscord()}
          </>
        )}
        {activeSection === 'about' && (
          <div className="settings-section">
            <p>Guide Trade v1.0</p>
            <p>AI-powered financial research assistant</p>
            <p>Not financial advice. Do your own research.</p>
          </div>
        )}
      </div>

      {testResult && (
        <div className={`test-result ${testResult.type}`}>
          {testResult.message}
        </div>
      )}

      <div className="settings-actions">
        <button className="btn-primary" onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'research' }))}>
          <span>Research</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'watchlist' }))}>
          <span>Watchlist</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'history' }))}>
          <span>History</span>
        </button>
        <button className="nav-item active" onClick={() => {}}>
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}
