import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface SmsPluginInterface {
  /**
   * Fetch SMS messages from the device
   * @returns Promise with an array of SMS messages
   */
  fetchMessages(): Promise<{ messages: SmsData[] }>;
  
  /**
   * Check if the app has SMS permissions
   * @returns Promise with permission status
   */
  hasSmsPermissions(): Promise<{ granted: boolean }>;
  
  /**
   * Request SMS permissions
   * @returns Promise with permission request result
   */
  requestSmsPermissions(): Promise<{ granted: boolean }>;
  
  /**
   * Add listener for SMS received events
   * @param eventName - Name of the event to listen for
   * @param listenerFunc - Function to call when event is triggered
   * @returns Promise with a listener handle
   */
  addListener(
    eventName: 'smsReceived',
    listenerFunc: (data: SmsData) => void
  ): Promise<PluginListenerHandle>;
  
  /**
   * Remove all listeners
   */
  removeAllListeners(): Promise<void>;
}

export interface SmsData {
  sender: string;
  body: string;
  timestamp: number;
}

const SmsPlugin = registerPlugin<SmsPluginInterface>('SmsPlugin');

export default SmsPlugin;