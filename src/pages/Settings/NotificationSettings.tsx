import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

export default function NotificationSettings() {
  const notificationTypes = [
    {
      id: 'email',
      title: 'Email Notifications',
      icon: Mail,
      description: 'Get notified about prospect responses and follow-up reminders via email',
      enabled: true
    },
    {
      id: 'push',
      title: 'Push Notifications',
      icon: Bell,
      description: 'Receive browser notifications for important updates',
      enabled: false
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      icon: Smartphone,
      description: 'Get text messages for urgent notifications',
      enabled: false
    },
    {
      id: 'slack',
      title: 'Slack Notifications',
      icon: MessageSquare,
      description: 'Receive notifications in your Slack workspace',
      enabled: false
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Notification Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage how and when you want to be notified
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h2>
          <div className="space-y-4">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${type.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{type.title}</h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={type.enabled}
                      onChange={() => { }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Email Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Daily Summary</h3>
                <p className="text-sm text-gray-500">Get a daily digest of your prospect activity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked onChange={() => { }} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Weekly Report</h3>
                <p className="text-sm text-gray-500">Receive a weekly summary of your follow-up performance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked onChange={() => { }} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Schedule</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiet Hours Start
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="22:00"
                onChange={() => { }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiet Hours End
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="08:00"
                onChange={() => { }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}