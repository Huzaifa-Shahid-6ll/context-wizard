"use client";

import { PlusIcon } from 'lucide-react';
import { Boxes, RefreshCw, Headphones, HelpCircle } from '@/lib/icons';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';

export type AccordionItemData = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  onItemClick?: () => void;
};

type AccordionExpandIconProps = {
  items: AccordionItemData[];
  defaultValue?: string;
  className?: string;
};

const AccordionExpandIconDemo = ({
  items,
  defaultValue = 'item-1',
  className = 'w-full'
}: AccordionExpandIconProps) => {
  return (
    <Accordion type='single' collapsible className={className} defaultValue={defaultValue}>
      {items.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionPrimitive.Header className='flex'>
              <AccordionPrimitive.Trigger
                data-slot='accordion-trigger'
                className='border-b border-white/10 py-4 px-4 text-left text-base font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/30 hover:bg-white/5 [&[data-state=open]>svg]:rotate-45'
                onClick={item.onItemClick}
              >
                <span className='flex items-center gap-4'>
                  <IconComponent className='size-5 shrink-0 text-purple-400' />
                  <span className='text-lg font-semibold text-white'>{item.title}</span>
                </span>
                <PlusIcon className='pointer-events-none size-4 shrink-0 transition-transform duration-200 text-white/60' />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className='text-white/70 px-4'>{item.content}</AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default AccordionExpandIconDemo;

