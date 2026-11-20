import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';

import { env } from '../config/env-config';
import { APP_NAME } from '../constants/config.constants';

// FCM token chunk limit per request
const FCM_MAX_TOKEN_LIMIT = 499;

let adminInstance: App | null = null;

export interface SendNotificationOptions {
  tokens?: string[];
  message?: string;
  type?: string;
  title?: string;
  metadata?: Record<string, unknown> | null;
}

export interface FcmNotificationResult {
  successCount: number;
  failureCount: number;
  mock?: boolean;
  errors: Array<{ token?: string; error: unknown }>;
}

/**
 * Checks if Firebase credentials are fully configured in environment variables
 */
export const isFirebaseEnabled = (): boolean =>
  env.USE_FIREBASE &&
  Boolean(env.FIREBASE_PROJECT_ID) &&
  Boolean(env.FIREBASE_CLIENT_EMAIL) &&
  Boolean(env.FIREBASE_PRIVATE_KEY);

/**
 * Initializes the Firebase Admin SDK singleton instance
 */
export const initFirebaseAdmin = (): App | null => {
  if (getApps().length > 0) return getApps()[0];

  if (!isFirebaseEnabled()) {
    console.warn('⚠️ Firebase credentials not configured in environment variables.');
    return null;
  }

  try {
    adminInstance = initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });

    return adminInstance;
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to initialize Firebase Admin SDK:', errMessage);
    return null;
  }
};

/**
 * Splits an array into smaller chunks (up to 499 tokens per FCM batch)
 */
const chunkArray = <T>(arr: T[] = [], size = FCM_MAX_TOKEN_LIMIT): T[][] => {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
};

/**
 * Constructs the FCM MulticastMessage payload
 */
const createNotificationPayload = ({
  tokens = [],
  message = '',
  type = '',
  title = APP_NAME,
  metadata = null,
}: SendNotificationOptions): MulticastMessage => {
  const defaultSound = 'default';
  const defaultChannelId = 'default';

  // Ensure all data payload fields are string values (FCM requirement)
  const dataPayload: Record<string, string> = {
    type: String(type),
    sound: defaultSound,
  };

  if (metadata) {
    Object.entries(metadata).forEach(([key, val]) => {
      dataPayload[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
    });
  }

  const messageObj: MulticastMessage = {
    tokens,
    data: dataPayload,
    android: {
      notification: {
        sound: defaultSound,
        channelId: defaultChannelId,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: defaultSound,
        },
      },
    },
  };

  if (message) {
    messageObj.notification = {
      title,
      body: message,
    };
  }

  return messageObj;
};

/**
 * Sends multicast push notification to device tokens via Firebase Cloud Messaging (FCM)
 */
export const sendFcmNotification = async ({
  tokens = [],
  message = '',
  type = '',
  title = APP_NAME,
  metadata = null,
}: SendNotificationOptions): Promise<FcmNotificationResult> => {
  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, errors: [] };
  }

  const app = initFirebaseAdmin();
  if (!app) {
    console.log(
      `[Firebase Notification Simulation] Tokens: ${tokens.length} | Title: ${title} | Body: ${message}`,
    );
    return {
      successCount: tokens.length,
      failureCount: 0,
      mock: true,
      errors: [],
    };
  }

  const messaging = getMessaging(app);
  const chunks = chunkArray(tokens, FCM_MAX_TOKEN_LIMIT);
  const results: FcmNotificationResult = { successCount: 0, failureCount: 0, errors: [] };

  for (const chunk of chunks) {
    try {
      const payload = createNotificationPayload({
        tokens: chunk,
        message,
        type,
        title,
        metadata,
      });

      const resp = await messaging.sendEachForMulticast(payload);
      results.successCount += resp?.successCount || 0;
      results.failureCount += resp?.failureCount || 0;

      resp?.responses?.forEach((r: { success: boolean; error?: unknown }, idx: number) => {
        if (r?.error) {
          results.errors.push({ token: chunk[idx], error: r.error });
        }
      });
    } catch (err) {
      results.errors.push({ error: err });
    }
  }

  return results;
};

// Alias export for sendFcmNotification
export const sendPushNotification = sendFcmNotification;

export default sendFcmNotification;
