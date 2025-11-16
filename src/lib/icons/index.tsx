"use client";

/**
 * Central icon exports
 * Drop-in replacement for lucide-react icons
 * 
 * Usage: import { Check, X, ArrowRight } from "@/lib/icons"
 * Instead of: import { Check, X, ArrowRight } from "lucide-react"
 */

import React from 'react';
import { IconWrapper } from './IconWrapper';
import { iconMapping, type IconComponent } from './iconMapping';

// Helper function to create icon component
function createIconComponent(name: string, iconData: IconComponent) {
  const Icon = React.forwardRef<
    SVGSVGElement,
    Omit<React.SVGProps<SVGSVGElement>, 'icon' | 'strokeWidth'> & { strokeWidth?: number }
  >((props, ref) => {
    return (
      <IconWrapper
        icon={iconData}
        ref={ref}
        {...props}
      />
    );
  });
  
  Icon.displayName = name;
  return Icon;
}

// Export all icons as components
export const ArrowRight = createIconComponent('ArrowRight', iconMapping.ArrowRight);
export const ArrowLeft = createIconComponent('ArrowLeft', iconMapping.ArrowLeft);
export const ArrowUp = createIconComponent('ArrowUp', iconMapping.ArrowUp);
export const ChevronLeft = createIconComponent('ChevronLeft', iconMapping.ChevronLeft);
export const ChevronRight = createIconComponent('ChevronRight', iconMapping.ChevronRight);
export const ChevronDown = createIconComponent('ChevronDown', iconMapping.ChevronDown);

export const Check = createIconComponent('Check', iconMapping.Check);
export const CheckCircle2 = createIconComponent('CheckCircle2', iconMapping.CheckCircle2);
export const X = createIconComponent('X', iconMapping.X);
export const XCircle = createIconComponent('XCircle', iconMapping.XCircle);
export const XIcon = createIconComponent('XIcon', iconMapping.XIcon);
export const AlertCircle = createIconComponent('AlertCircle', iconMapping.AlertCircle);
export const AlertTriangle = createIconComponent('AlertTriangle', iconMapping.AlertTriangle);

export const FileText = createIconComponent('FileText', iconMapping.FileText);
export const FileCode = createIconComponent('FileCode', iconMapping.FileCode);
export const FileCode2 = createIconComponent('FileCode2', iconMapping.FileCode2);
export const FileJson = createIconComponent('FileJson', iconMapping.FileJson);
export const File = createIconComponent('File', iconMapping.File);
export const BookOpen = createIconComponent('BookOpen', iconMapping.BookOpen);

export const Menu = createIconComponent('Menu', iconMapping.Menu);
export const Home = createIconComponent('Home', iconMapping.Home);
export const Settings = createIconComponent('Settings', iconMapping.Settings);
export const SettingsIcon = createIconComponent('SettingsIcon', iconMapping.SettingsIcon);
export const Search = createIconComponent('Search', iconMapping.Search);
export const Eye = createIconComponent('Eye', iconMapping.Eye);
export const Download = createIconComponent('Download', iconMapping.Download);
export const Save = createIconComponent('Save', iconMapping.Save);
export const Copy = createIconComponent('Copy', iconMapping.Copy);
export const RefreshCw = createIconComponent('RefreshCw', iconMapping.RefreshCw);
export const RefreshCcw = createIconComponent('RefreshCcw', iconMapping.RefreshCcw);
export const Trash2 = createIconComponent('Trash2', iconMapping.Trash2);

export const MessageSquare = createIconComponent('MessageSquare', iconMapping.MessageSquare);
export const MessageCircle = createIconComponent('MessageCircle', iconMapping.MessageCircle);
export const Mail = createIconComponent('Mail', iconMapping.Mail);
export const Send = createIconComponent('Send', iconMapping.Send);

export const Video = createIconComponent('Video', iconMapping.Video);
export const Play = createIconComponent('Play', iconMapping.Play);
export const Camera = createIconComponent('Camera', iconMapping.Camera);
export const Film = createIconComponent('Film', iconMapping.Film);
export const Image = createIconComponent('Image', iconMapping.Image);

export const CreditCard = createIconComponent('CreditCard', iconMapping.CreditCard);
export const DollarSign = createIconComponent('DollarSign', iconMapping.DollarSign);
export const Activity = createIconComponent('Activity', iconMapping.Activity);
export const TrendingUp = createIconComponent('TrendingUp', iconMapping.TrendingUp);
export const BarChart2 = createIconComponent('BarChart2', iconMapping.BarChart2);

export const Shield = createIconComponent('Shield', iconMapping.Shield);
export const ShieldCheck = createIconComponent('ShieldCheck', iconMapping.ShieldCheck);
export const Lock = createIconComponent('Lock', iconMapping.Lock);
export const User = createIconComponent('User', iconMapping.User);
export const UserPlus = createIconComponent('UserPlus', iconMapping.UserPlus);
export const Crown = createIconComponent('Crown', iconMapping.Crown);

export const Code = createIconComponent('Code', iconMapping.Code);
export const Code2 = createIconComponent('Code2', iconMapping.Code2);
export const CodeSlash = createIconComponent('CodeSlash', iconMapping.CodeSlash);
export const Terminal = createIconComponent('Terminal', iconMapping.Terminal);
export const Server = createIconComponent('Server', iconMapping.Server);
export const Database = createIconComponent('Database', iconMapping.Database);
export const Boxes = createIconComponent('Boxes', iconMapping.Boxes);
export const Braces = createIconComponent('Braces', iconMapping.Braces);

export const Github = createIconComponent('Github', iconMapping.Github);
export const Twitter = createIconComponent('Twitter', iconMapping.Twitter);
export const Linkedin = createIconComponent('Linkedin', iconMapping.Linkedin);

export const Calendar = createIconComponent('Calendar', iconMapping.Calendar);
export const Clock = createIconComponent('Clock', iconMapping.Clock);

export const Sparkles = createIconComponent('Sparkles', iconMapping.Sparkles);
export const Zap = createIconComponent('Zap', iconMapping.Zap);
export const Target = createIconComponent('Target', iconMapping.Target);
export const Gift = createIconComponent('Gift', iconMapping.Gift);
export const Star = createIconComponent('Star', iconMapping.Star);
export const Award = createIconComponent('Award', iconMapping.Award);
export const Headphones = createIconComponent('Headphones', iconMapping.Headphones);
export const Plug = createIconComponent('Plug', iconMapping.Plug);
export const Workflow = createIconComponent('Workflow', iconMapping.Workflow);
export const Map = createIconComponent('Map', iconMapping.Map);
export const Layers = createIconComponent('Layers', iconMapping.Layers);
export const Bot = createIconComponent('Bot', iconMapping.Bot);
export const GitFork = createIconComponent('GitFork', iconMapping.GitFork);
export const GitPullRequest = createIconComponent('GitPullRequest', iconMapping.GitPullRequest);
export const GitBranch = createIconComponent('GitBranch', iconMapping.GitBranch);
export const Rocket = createIconComponent('Rocket', iconMapping.Rocket);
export const Brain = createIconComponent('Brain', iconMapping.Brain);
export const Wrench = createIconComponent('Wrench', iconMapping.Wrench);
export const AppWindow = createIconComponent('AppWindow', iconMapping.AppWindow);
export const GraduationCap = createIconComponent('GraduationCap', iconMapping.GraduationCap);
export const Loader2 = createIconComponent('Loader2', iconMapping.Loader2);
export const Plus = createIconComponent('Plus', iconMapping.Plus);
export const GripHorizontal = createIconComponent('GripHorizontal', iconMapping.GripHorizontal);
export const Ban = createIconComponent('Ban', iconMapping.Ban);
export const Users = createIconComponent('Users', iconMapping.Users);
export const Bell = createIconComponent('Bell', iconMapping.Bell);
export const HelpCircle = createIconComponent('HelpCircle', iconMapping.HelpCircle);

// UI Component Icons
export const CheckIcon = createIconComponent('CheckIcon', iconMapping.CheckIcon);
export const ChevronRightIcon = createIconComponent('ChevronRightIcon', iconMapping.ChevronRightIcon);
export const CircleIcon = createIconComponent('CircleIcon', iconMapping.CircleIcon);

