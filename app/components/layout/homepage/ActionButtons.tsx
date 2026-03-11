import { actionItems } from '@/app/Data';
import { ActionButtonsProps } from '@/app/types';
import { ActionButton } from '@/components/ui/action-button';

export default function ActionButtons({ items = {} }: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row mb-8 sm:mb-16 justify-end gap-3 sm:gap-6">
      <ActionButton href={actionItems.button1.href} icon={actionItems.button1.icon} iconPosition="start">
        {actionItems.button1.title}
      </ActionButton>
      <ActionButton href={actionItems.button2.href} icon={actionItems.button2.icon} iconPosition="end" className="justify-around">
        {actionItems.button2.title}
      </ActionButton>
    </div>
  );
}
