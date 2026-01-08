import { actionItems } from '@/app/Data';
import { ActionButtonsProps } from '@/app/types';

export default function ActionButtons({ items = {} }: ActionButtonsProps) {
  return (
    <div className="flex mb-16 justify-end gap-6">
      
        <a
          href={actionItems.button1.href}
          className="bg-[#131e1e] text-white px-6 py-3 rounded-md flex items-center transition-all duration-300 hover:bg-[rgba(var(--green-darker-rgb),0.8)] hover:shadow-md"
        >
          <span className="ml-2">{actionItems.button1.icon}</span>
          {actionItems.button1.title}
        </a>
        <a
          href={actionItems.button2.href}
          className="bg-[#131e1e] text-white px-6 py-3 rounded-md flex items-center justify-around transition-all duration-300 hover:bg-[rgba(var(--green-darker-rgb),0.8)] hover:shadow-md"
        >
          {actionItems.button2.title}
          <span className="mr-3">{actionItems.button2.icon}</span>
        </a>
      
    </div>
  );
}
