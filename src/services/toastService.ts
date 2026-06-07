export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

type ToastSubscriber = (toasts: Toast[]) => void;

class ToastService {
  private toasts: Toast[] = [];
  private subscribers: Set<ToastSubscriber> = new Set();

  subscribe(subscriber: ToastSubscriber) {
    this.subscribers.add(subscriber);
    subscriber([...this.toasts]);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify() {
    this.subscribers.forEach((sub) => sub([...this.toasts]));
  }

  show(type: Toast['type'], message: string, duration = 5000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, type, message, duration };
    
    // Eviter les doublons exacts et successifs de messages d'erreur rapides
    if (this.toasts.length > 0 && this.toasts[this.toasts.length - 1].message === message) {
      return id;
    }

    this.toasts.push(toast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
    return id;
  }

  success(message: string, duration?: number) {
    return this.show('success', message, duration);
  }

  error(message: string, duration?: number) {
    return this.show('error', message, duration);
  }

  warning(message: string, duration?: number) {
    return this.show('warning', message, duration);
  }

  info(message: string, duration?: number) {
    return this.show('info', message, duration);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toast = new ToastService();
