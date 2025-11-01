// Mock data for people - used by demo components
export interface Person {
  name: string;
  role: string;
  avatar: string;
}

export function getAllPeople(): Person[] {
  return [
    {
      name: "Eduardo Calvo",
      role: "CEO & Founder",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
    },
    {
      name: "Sarah Chen",
      role: "Head of Design",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=96&h=96&fit=crop&crop=face"
    },
    {
      name: "Marcus Johnson",
      role: "Lead Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face"
    }
  ];
}

export function getAvatarUrl(avatar: string, size: number): string {
  if (!avatar) {
    return `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=${size}&h=${size}&fit=crop&crop=face`;
  }
  
  // If it's already a full URL, return as is
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // Otherwise, assume it's a path and construct the URL
  return avatar;
}
