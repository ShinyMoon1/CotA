interface TelegramWebApp {
  initData?: string;
  platform?: string;
  colorScheme?: string;
  showAlert?: (message: string) => void;
  ready?: () => void;
  expand?: () => void;
  onEvent?: (eventType: string, handler: () => void) => void;
  offEvent?: (eventType: string, handler: () => void) => void;
}

interface Window {
  Telegram?: { WebApp?: TelegramWebApp };
}
