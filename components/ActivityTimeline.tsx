
import React from 'react';
import { UserEvent } from '../types';
import { 
  ArrowRightOnRectangleIcon, 
  UserPlusIcon, 
  SparklesIcon, 
  BeakerIcon, 
  CheckBadgeIcon, 
  ArrowPathIcon,
  ShoppingBagIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

interface ActivityTimelineProps {
  events: UserEvent[];
}

const getEventIcon = (type: UserEvent['eventType']) => {
  switch (type) {
    case 'LOGIN': return ArrowRightOnRectangleIcon;
    case 'REGISTER': return UserPlusIcon;
    case 'AI_USED': return SparklesIcon;
    case 'QUIZ_COMPLETED': return BeakerIcon;
    case 'EMAIL_VERIFIED': return CheckBadgeIcon;
    case 'PASSWORD_RESET': return ArrowPathIcon;
    case 'SUBSCRIPTION_REQUESTED': return ShoppingBagIcon;
    case 'PROFILE_UPDATED': return FingerPrintIcon;
    default: return SparklesIcon;
  }
};

const getEventLabel = (type: UserEvent['eventType']) => {
  switch (type) {
    case 'LOGIN': return 'ورود به سیستم';
    case 'REGISTER': return 'ثبت‌نام در فیت پرو';
    case 'AI_USED': return 'استفاده از هوش مصنوعی ساسکا';
    case 'QUIZ_COMPLETED': return 'تکمیل آنالیز بدنی';
    case 'EMAIL_VERIFIED': return 'تایید ایمیل';
    case 'PASSWORD_RESET': return 'تغییر رمز عبور';
    case 'SUBSCRIPTION_REQUESTED': return 'درخواست اشتراک ELITE';
    case 'PROFILE_UPDATED': return 'بروزرسانی پروفایل';
    default: return type;
  }
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>هنوز فعالیتی ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => {
          const Icon = getEventIcon(event.eventType);
          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span className="absolute right-4 top-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3 space-x-reverse">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center ring-4 ring-gray-900 border border-gray-700">
                      <Icon className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 space-x-reverse pt-1.5">
                    <div>
                      <p className="text-sm text-gray-300">
                        {getEventLabel(event.eventType)} <span className="text-gray-500 font-mono text-xs">({event.source})</span>
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-left text-xs text-gray-500">
                      <time dir="ltr">{new Date(event.createdAt).toLocaleDateString('fa-IR')}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActivityTimeline;
