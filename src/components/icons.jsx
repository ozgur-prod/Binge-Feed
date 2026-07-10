import {
  Heart, Trash2, User, MessageSquare, Bookmark, Share2, Repeat,
  Plus, Star, PenLine, List, Calendar, ChevronLeft, ChevronRight, ChevronDown, Play, Check, Crown,
  X, Flame, Bell, BarChart3, Palette, MessageCircle, Rocket, Gift, Lock,
  PartyPopper, TriangleAlert, Hand, Home, Search, CircleHelp, LogOut,
} from 'lucide-react';

// Icons we use to keep everything looking the same
const defaults = { size: 18, strokeWidth: 2 };

export const HeartIcon = (props) => <Heart {...defaults} {...props} />;
export const TrashIcon = (props) => <Trash2 {...defaults} {...props} />;
export const UserIcon = (props) => <User {...defaults} {...props} />;
export const MessageSquareIcon = (props) => <MessageSquare {...defaults} {...props} />;
export const BookmarkIcon = (props) => <Bookmark {...defaults} {...props} />;
export const ShareIcon = (props) => <Share2 {...defaults} {...props} />;
export const RepeatIcon = (props) => <Repeat {...defaults} {...props} />;
export const PlusIcon = (props) => <Plus {...defaults} {...props} />;
export const StarIcon = (props) => <Star {...defaults} {...props} />;
export const PenLineIcon = (props) => <PenLine {...defaults} {...props} />;
export const ListIcon = (props) => <List {...defaults} {...props} />;
export const CalendarIcon = (props) => <Calendar {...defaults} {...props} />;
export const ChevronLeftIcon = (props) => <ChevronLeft {...defaults} {...props} />;
export const ChevronRightIcon = (props) => <ChevronRight {...defaults} {...props} />;
export const ChevronDownIcon = (props) => <ChevronDown {...defaults} {...props} />;
export const CheckIcon = (props) => <Check {...defaults} {...props} />;
export const XIcon = (props) => <X {...defaults} {...props} />;
export const FlameIcon = (props) => <Flame {...defaults} {...props} />;
export const BellIcon = (props) => <Bell {...defaults} {...props} />;
export const BarChartIcon = (props) => <BarChart3 {...defaults} {...props} />;
export const PaletteIcon = (props) => <Palette {...defaults} {...props} />;
export const MessageCircleIcon = (props) => <MessageCircle {...defaults} {...props} />;
export const RocketIcon = (props) => <Rocket {...defaults} {...props} />;
export const GiftIcon = (props) => <Gift {...defaults} {...props} />;
export const LockIcon = (props) => <Lock {...defaults} {...props} />;
export const PartyPopperIcon = (props) => <PartyPopper {...defaults} {...props} />;
export const AlertTriangleIcon = (props) => <TriangleAlert {...defaults} {...props} />;
export const HandIcon = (props) => <Hand {...defaults} {...props} />;
export const HomeIcon = (props) => <Home {...defaults} {...props} />;
export const SearchIcon = (props) => <Search {...defaults} {...props} />;
export const CircleHelpIcon = (props) => <CircleHelp {...defaults} {...props} />;
export const LogOutIcon = (props) => <LogOut {...defaults} {...props} />;

export const PlayIcon = (props) => <Play size={18} fill="currentColor" stroke="none" {...props} />;
export const CrownIcon = (props) => <Crown size={18} fill="currentColor" strokeWidth={1.5} {...props} />;

export function StarHalfIcon({ size = 18, className, style }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}
    >
      <defs>
        <clipPath id="star-left-half">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="currentColor"
        stroke="none"
        clipPath="url(#star-left-half)"
      />
    </svg>
  );
}
