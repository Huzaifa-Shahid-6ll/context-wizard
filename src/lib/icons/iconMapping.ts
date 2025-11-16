/**
 * Icon mapping from Lucide React to Lineicons
 * Maps Lucide icon names to their Lineicons equivalents
 */

import {
  // Arrows & Navigation
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ArrowUpwardOutlined, // For ArrowUp (using ArrowUpward as closest match)
  ChevronLeftOutlined,
  ArrowRightOutlined as ChevronRightOutlined, // Using ArrowRight as closest match for ChevronRight
  ChevronDownOutlined,
  
  // Status & Actions
  CheckCircle1Outlined,
  CheckOutlined,
  XmarkOutlined, // For Close/X (using Xmark as closest match)
  XmarkCircleOutlined, // For CloseCircle/XCircle (using XmarkCircle as closest match)
  QuestionMarkCircleOutlined, // For AlertCircle (using QuestionMarkCircle as closest match)
  
  // Files & Documents
  FileMultipleOutlined, // For FileText, FileJson, File
  MonitorCodeOutlined, // For FileCode
  CodeSOutlined, // For FileCode2
  Book1Outlined,
  
  // UI & Interface
  MenuHamburger1Outlined, // For Menu
  Home2Outlined, // For Home
  Gear1Outlined, // For Settings (using Gear1 as closest match)
  Search1Outlined, // For Search
  EyeOutlined,
  Download1Outlined,
  FloppyDisk1Outlined, // For Save
  ClipboardOutlined, // For Copy
  CloudRefreshClockwiseOutlined,
  RefreshCircle1ClockwiseOutlined, // For RefreshCcw
  Trash3Outlined, // For Trash2
  
  // Communication
  Message2Outlined, // For MessageSquare, MessageCircle
  Envelope1Outlined, // For Mail
  EnterOutlined, // For Send (using Enter as closest match)
  
  // Media
  CameraMovie1Outlined, // For Video, Film
  PlayOutlined,
  Camera1Outlined,
  PhotosOutlined, // For Image
  
  // Business & Finance
  CreditCardMultipleOutlined,
  DollarOutlined,
  Gauge1Outlined, // For Activity (using Gauge as closest match)
  TrendUp1Outlined, // For TrendingUp
  BarChart4Outlined,
  
  // Security & Access
  Shield2Outlined, // For Shield
  Locked1Outlined, // For Lock
  User4Outlined, // For User
  UserMultiple4Outlined, // For UserPlus (using UserMultiple as closest match)
  Crown3Outlined,
  
  // Development & Code
  Code1Outlined,
  Code1Outlined as TerminalOutlined, // For Terminal (using Code1 as closest match)
  Database2Outlined as ServerOutlined, // For Server (using Database2 as closest match)
  Database2Outlined,
  BoxClosedOutlined,
  CodeSOutlined as BracesOutlined, // For Braces (using CodeS as closest match)
  
  // Social & Brand
  GithubOutlined,
  TwitterOldOutlined, // For Twitter (using TwitterOld as closest match)
  GitOutlined, // For GitFork, GitPullRequest, GitBranch
  LinkedinOutlined,
  
  // Time & Calendar
  CalendarDaysOutlined,
  StopwatchOutlined, // For Clock (using Stopwatch as closest match)
  
  // Other
  StarFatOutlined, // For Sparkles, Star (using Star as closest match)
  Bolt2Outlined, // For Zap
  TargetUserOutlined, // For Target
  BoxGift1Outlined,
  Trophy1Outlined, // For Award
  Headphone1Outlined, // For Headphones
  Plug1Outlined, // For Plug
  Hierarchy1Outlined, // For Workflow (using Hierarchy as closest match)
  MapMarker1Outlined, // For Map
  Layers1Outlined, // For Layers
  Bulb2Outlined, // For Bot, Brain (using Bulb as closest match)
  GitOutlined as GitForkOutlined, // For GitFork (using Git as closest match)
  GitOutlined as GitPullRequestOutlined, // For GitPullRequest (using Git as closest match)
  Rocket5Outlined, // For Rocket
  Hammer1Outlined, // For Wrench (using Hammer as closest match)
  WindowsOutlined, // For AppWindow (using Windows as closest match)
  GraduationCap1Outlined,
  Spinner3Outlined, // Using Spinner as closest match for Loader2
  PlusOutlined,
  MenuMeatballs1Outlined, // For GripHorizontal (using MenuMeatballs as closest match)
  Ban2Outlined,
  Shield2CheckOutlined, // For ShieldCheck
  Bell1Outlined, // For Bell/Notifications
} from '@lineiconshq/free-icons';

// Type for icon data (IconData from Lineicons)
// IconData is not exported from the main package, so we infer it from the imported icons
export type IconComponent = typeof ArrowRightOutlined;

// Mapping object: Lucide icon name -> Lineicons component
export const iconMapping: Record<string, IconComponent> = {
  // Arrows & Navigation
  ArrowRight: ArrowRightOutlined,
  ArrowLeft: ArrowLeftOutlined,
  ArrowUp: ArrowUpwardOutlined,
  ChevronLeft: ChevronLeftOutlined,
  ChevronRight: ArrowRightOutlined, // Using ArrowRight as closest match
  ChevronDown: ChevronDownOutlined,
  
  // Status & Actions
  Check: CheckCircle1Outlined,
  CheckCircle2: CheckCircle1Outlined,
  X: XmarkOutlined,
  XCircle: XmarkCircleOutlined,
  XIcon: XmarkOutlined,
  AlertCircle: QuestionMarkCircleOutlined, // Using QuestionMarkCircle as closest match
  AlertTriangle: XmarkCircleOutlined, // Using XmarkCircle as closest match
  
  // Files & Documents
  FileText: FileMultipleOutlined,
  FileCode: MonitorCodeOutlined,
  FileCode2: CodeSOutlined,
  FileJson: FileMultipleOutlined,
  File: FileMultipleOutlined,
  BookOpen: Book1Outlined,
  
  // UI & Interface
  Menu: MenuHamburger1Outlined,
  Home: Home2Outlined,
  Settings: Gear1Outlined,
  SettingsIcon: Gear1Outlined,
  Search: Search1Outlined,
  Eye: EyeOutlined,
  Download: Download1Outlined,
  Save: FloppyDisk1Outlined,
  Copy: ClipboardOutlined,
  RefreshCw: CloudRefreshClockwiseOutlined,
  RefreshCcw: RefreshCircle1ClockwiseOutlined,
  Trash2: Trash3Outlined,
  
  // Communication
  MessageSquare: Message2Outlined,
  MessageCircle: Message2Outlined,
  Mail: Envelope1Outlined,
  Send: EnterOutlined,
  
  // Media
  Video: CameraMovie1Outlined,
  Play: PlayOutlined,
  Camera: Camera1Outlined,
  Film: CameraMovie1Outlined,
  Image: PhotosOutlined,
  
  // Business & Finance
  CreditCard: CreditCardMultipleOutlined,
  DollarSign: DollarOutlined,
  Activity: Gauge1Outlined,
  TrendingUp: TrendUp1Outlined,
  BarChart2: BarChart4Outlined,
  
  // Security & Access
  Shield: Shield2Outlined,
  ShieldCheck: Shield2CheckOutlined,
  Lock: Locked1Outlined,
  User: User4Outlined,
  UserPlus: UserMultiple4Outlined, // Using UserMultiple as closest match
  Crown: Crown3Outlined,
  
  // Development & Code
  Code: Code1Outlined,
  Code2: CodeSOutlined,
  CodeSlash: CodeSOutlined,
  Terminal: Code1Outlined, // Using Code1 as closest match
  Server: Database2Outlined, // Using Database2 as closest match
  Database: Database2Outlined,
  Boxes: BoxClosedOutlined,
  Braces: CodeSOutlined, // Using CodeS as closest match
  
  // Social & Brand
  Github: GithubOutlined,
  Twitter: TwitterOldOutlined,
  Linkedin: LinkedinOutlined,
  
  // Time & Calendar
  Calendar: CalendarDaysOutlined,
  Clock: StopwatchOutlined, // Using Stopwatch as closest match
  
  // Other
  Sparkles: StarFatOutlined, // Using Star as closest match
  Zap: Bolt2Outlined,
  Target: TargetUserOutlined,
  Gift: BoxGift1Outlined,
  Star: StarFatOutlined,
  Award: Trophy1Outlined,
  Headphones: Headphone1Outlined,
  Plug: Plug1Outlined,
  Workflow: Hierarchy1Outlined, // Using Hierarchy as closest match
  Map: MapMarker1Outlined,
  Layers: Layers1Outlined,
  Bot: Bulb2Outlined, // Using Bulb as closest match (Robot might not exist)
  GitFork: GitOutlined, // Using Git as closest match
  GitPullRequest: GitOutlined, // Using Git as closest match
  GitBranch: GitOutlined, // Using Git as closest match
  Rocket: Rocket5Outlined,
  Brain: Bulb2Outlined, // Using Bulb as closest match for Brain
  Wrench: Hammer1Outlined, // Using Hammer as closest match
  AppWindow: WindowsOutlined, // Using Windows as closest match for AppWindow
  GraduationCap: GraduationCap1Outlined,
  Loader2: Spinner3Outlined, // Using Spinner as closest match for Loader2
  Plus: PlusOutlined,
  GripHorizontal: MenuMeatballs1Outlined, // Using MenuMeatballs as closest match
  Ban: Ban2Outlined,
  Users: UserMultiple4Outlined, // For Users icon
  Bell: Bell1Outlined, // For Bell/Notifications
  HelpCircle: QuestionMarkCircleOutlined, // For HelpCircle
  
  // UI Component Icons
  CheckIcon: CheckCircle1Outlined,
  ChevronRightIcon: ArrowRightOutlined, // Using ArrowRight as closest match
  CircleIcon: QuestionMarkCircleOutlined, // Using QuestionMarkCircle as closest match
};

