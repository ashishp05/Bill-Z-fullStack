declare module 'firebase-admin/app' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type App = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function initializeApp(options?: any): App;
  export function getApps(): App[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function cert(serviceAccountPathOrObject: any): any;
}

declare module 'firebase-admin/messaging' {
  export interface MulticastMessage {
    tokens: string[];
    data?: Record<string, string>;
    notification?: {
      title?: string;
      body?: string;
      imageUrl?: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    android?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apns?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webpush?: any;
  }

  export interface BatchResponse {
    successCount: number;
    failureCount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responses: Array<{ success: boolean; error?: any; messageId?: string }>;
  }

  export interface Messaging {
    sendEachForMulticast(message: MulticastMessage): Promise<BatchResponse>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function getMessaging(app?: any): Messaging;
}
