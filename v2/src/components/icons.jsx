import {
  Search, ShoppingCart, User, Menu, X, Plus, Minus, Trash2, Check, ChevronDown, ChevronRight, ChevronLeft, Truck, ShieldCheck, Package,
  Phone, Mail, Clock, Headphones, RefreshCw, LayoutGrid, List, SlidersHorizontal, LayoutDashboard, Users, Pencil, LogOut, ExternalLink,
  Home, Tags, ClipboardList, Eye, EyeOff, ArrowRight, MapPin, Lock, Boxes, MessageCircle, BadgePercent, FileText, Store, CircleAlert, Info,
} from 'lucide-react';

const MAP = {
  search: Search, cart: ShoppingCart, user: User, menu: Menu, x: X, plus: Plus, minus: Minus, trash: Trash2, check: Check,
  chevronDown: ChevronDown, chevronRight: ChevronRight, chevronLeft: ChevronLeft, truck: Truck, shield: ShieldCheck, box: Package, boxes: Boxes,
  phone: Phone, mail: Mail, clock: Clock, headset: Headphones, refresh: RefreshCw, grid: LayoutGrid, list: List, filter: SlidersHorizontal,
  dashboard: LayoutDashboard, users: Users, edit: Pencil, logout: LogOut, external: ExternalLink, home: Home, tags: Tags, orders: ClipboardList,
  eye: Eye, eyeOff: EyeOff, arrowRight: ArrowRight, pin: MapPin, lock: Lock, whatsapp: MessageCircle, offer: BadgePercent, file: FileText,
  store: Store, alert: CircleAlert, info: Info,
};

export function Icon({ name, size = 20, className = '', strokeWidth = 1.9, ...rest }) {
  const C = MAP[name] || Package;
  return <C size={size} strokeWidth={strokeWidth} aria-hidden="true" className={className} {...rest} />;
}
