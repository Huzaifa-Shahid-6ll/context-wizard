"use client";

import { PlusIcon } from 'lucide-react';
import { Boxes, RefreshCw, Headphones, HelpCircle } from '@/lib/icons';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import ShinyText from '@/components/ui/ShinyText';

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
                className='focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 px-4 text-left text-base font-bold transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-45'
                onClick={item.onItemClick}
              >
                <span className='flex items-center gap-4'>
                  <IconComponent className='size-5 shrink-0' />
                  <ShinyText text={item.title} speed={3} className='text-lg font-bold' />
                </span>
                <PlusIcon className='text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200' />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className='text-muted-foreground px-4'>{item.content}</AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default AccordionExpandIconDemo;

