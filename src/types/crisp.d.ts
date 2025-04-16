declare module 'crisp-chat' {
  interface CrispUser {
    setEmail(email: string): void;
    setNickname(nickname: string): void;
  }

  interface CrispChat {
    open(): void;
    show(): void;
    hide(): void;
    setTheme(theme: 'light' | 'dark'): void;
    setColor(color: string): void;
    setPosition(position: 'left' | 'right'): void;
    setLanguage(language: string): void;
  }

  interface Crisp {
    configure(websiteId: string): void;
    user: CrispUser;
    chat: CrispChat;
  }

  const Crisp: Crisp;
  export default Crisp;
} 