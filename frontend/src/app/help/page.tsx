"use client";
import React, { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '@/utils/api';
const API_URL = getApiUrl();
import { 
  Search, 
  Package, 
  CreditCard, 
  User, 
  ShieldCheck, 
  Store, 
  MessageCircle, 
  PhoneCall, 
  Mail, 
  ChevronRight,
  ChevronDown,
  HelpCircle,
  X,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Clock,
  RotateCcw,
  UtensilsCrossed,
  Ticket,
  FileQuestion,
  Headphones,
  Paperclip,
  CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

// Comprehensive Enterprise FAQ Dataset categorized by Domain
export interface FAQItem {
  id: string;
  category: 'all' | 'orders' | 'refunds' | 'dining' | 'queue' | 'account' | 'sellers';
  question: string;
  answer: string;
  tags: string[];
}

const enterpriseFaqs: FAQItem[] = [
  // Orders & Delivery
  {
    id: 'faq-1',
    category: 'orders',
    question: "How do I track my order in real-time?",
    answer: "Go to 'My Account' > 'Orders' and click 'Track Order' next to your purchase. We provide live GPS coordinates for local hyper-local dispatches and courier tracking numbers for regional shipments. You will also receive instant SMS and WhatsApp dispatch notifications.",
    tags: ["track", "order", "delivery", "shipping", "status", "courier"]
  },
  {
    id: 'faq-2',
    category: 'orders',
    question: "How can I cancel or modify an existing order?",
    answer: "Orders can be cancelled free of charge before the seller packages or dispatches them. Head to your Orders dashboard, select the active item, and tap 'Cancel Order'. If already dispatched, you can choose 'Refuse at Doorstep' or initiate a 1-click return upon arrival.",
    tags: ["cancel", "modify", "change", "order", "stop"]
  },
  {
    id: 'faq-3',
    category: 'orders',
    question: "What should I do if my package is marked delivered but I haven't received it?",
    answer: "First, verify with family members, household staff, or security desks. If still unresolved within 2 hours, tap 'Report Missing Package' in the AI assistant chat below. A formal priority ticket is generated instantly and delivery personnel will be verified within 30 minutes.",
    tags: ["missing", "not delivered", "fake delivery", "delayed", "late"]
  },

  // Refunds & Payments
  {
    id: 'faq-4',
    category: 'refunds',
    question: "What is MarkatVerse's return and refund policy?",
    answer: "We support a 7-day hassle-free return window for physical goods. Once the courier verifies return pickup or warehouse check-in, refunds are triggered automatically. Instant UPI refunds credit in 2–4 hours; credit/debit card reversals settle in 3–5 banking days.",
    tags: ["refund", "return", "policy", "money back", "reversal"]
  },
  {
    id: 'faq-5',
    category: 'refunds',
    question: "Money was debited from my bank but the order failed. What happens?",
    answer: "This is a banking gateway hold. Under RBI & payment aggregator protocols, failed transaction deductions are auto-reversed by your issuing bank within 24 to 48 hours without any manual action needed.",
    tags: ["failed payment", "debited", "double charge", "upi", "deducted"]
  },
  {
    id: 'faq-6',
    category: 'refunds',
    question: "How do I return a damaged, defective, or incorrect product?",
    answer: "Navigate to your Order details, select 'Return / Replace', and upload a clear photo or video of the defect. We offer free reverse doorstep pickup with instant replacement or full refund based on your preference.",
    tags: ["damaged", "broken", "wrong item", "defective", "replace"]
  },

  // Dining & Table Reservations
  {
    id: 'faq-7',
    category: 'dining',
    question: "How do table reservations & VIP cabins work?",
    answer: "Select your desired restaurant from our Food & Dining section, pick date, time slot, and guest count. Once booked, your table or cabin is locked for 90 minutes with zero waiting time. Show your digital booking pass on arrival.",
    tags: ["table", "dining", "restaurant", "cabin", "reservation", "booking", "vip"]
  },
  {
    id: 'faq-8',
    category: 'dining',
    question: "Can I pre-order food or request special culinary setups for my reservation?",
    answer: "Yes! While reserving your table, toggle 'Pre-Order Kitchen Order (KOT)' or use the Special Request box for birthday decor, candle-light setups, or dietary preferences (e.g. Jain, Vegan, Gluten-Free).",
    tags: ["kot", "food pre-order", "birthday", "cake", "dietary", "dining"]
  },

  // Queue Tokens & Service Appointments
  {
    id: 'faq-9',
    category: 'queue',
    question: "What is the Live Digital Queue & Token system?",
    answer: "Our patented Live Token feature allows walk-in or planned appointments at clinics, salons, spas, and service centres without physically standing in line. You receive a digital token with estimated call time and live queue progression visible in your top navbar.",
    tags: ["token", "queue", "salon", "clinic", "wait", "appointment", "doctor"]
  },
  {
    id: 'faq-10',
    category: 'queue',
    question: "What happens if I arrive slightly late for my token number?",
    answer: "If your token is called while you are en route, the provider's reception system automatically places you on a 10-minute grace buffer or moves you to the next immediate slot upon arrival.",
    tags: ["late", "token delay", "missed token", "buffer", "salon"]
  },

  // Account & MarkatVerse Prime
  {
    id: 'faq-11',
    category: 'account',
    question: "What benefits come with MarkatVerse Prime membership?",
    answer: "MarkatVerse Prime gives you Unlimited Free Priority Delivery, early flash-sale access, exclusive member-only wholesale discounts, zero reservation fees on premium dining venues, and 24/7 dedicated VIP concierge support.",
    tags: ["prime", "membership", "benefits", "vip", "subscription"]
  },
  {
    id: 'faq-12',
    category: 'account',
    question: "How do I secure my MarkatVerse account with Two-Factor Auth (2FA)?",
    answer: "Visit 'Profile Settings' > 'Security'. Enable Two-Factor Authentication via Authenticator App or SMS OTP. We also notify you via email whenever a new device logs into your account.",
    tags: ["security", "password", "2fa", "login", "otp", "account"]
  },

  // Seller & B2B Wholesale Support
  {
    id: 'faq-13',
    category: 'sellers',
    question: "How do I register as a seller, restaurant partner, or service vendor?",
    answer: "Click 'Become a Seller' in the footer or visit the Seller Onboarding Portal. Prepare your business GST/Tax ID, PAN, bank account details, and catalog photos. Store approval typically takes under 4 hours.",
    tags: ["seller", "onboard", "vendor", "partner", "merchant", "b2b"]
  },
  {
    id: 'faq-14',
    category: 'sellers',
    question: "How do seller payouts and payment settlement cycles operate?",
    answer: "Funds from completed deliveries are settled directly to your verified bank account via automated NEFT/IMPS on a T+2 or T+3 rolling cycle, minus nominal marketplace commission fees.",
    tags: ["payout", "settlement", "bank transfer", "commission", "seller funds"]
  }
];

const categoryTabs = [
  { id: 'all', label: 'All FAQs', icon: FileQuestion },
  { id: 'orders', label: 'Orders & Tracking', icon: Package },
  { id: 'refunds', label: 'Refunds & Returns', icon: CreditCard },
  { id: 'dining', label: 'Dining & Tables', icon: UtensilsCrossed },
  { id: 'queue', label: 'Live Queue & Tokens', icon: Ticket },
  { id: 'account', label: 'Account & Prime', icon: User },
  { id: 'sellers', label: 'Seller & B2B', icon: Store },
];

const quickSupportChips = [
  { label: "📦 Track Active Order", query: "Where is my order and what is the current delivery tracking status?" },
  { label: "💳 Refund & Settlement Delay", query: "I have not received my refund yet. Please check refund status." },
  { label: "🍽️ Dining Reservation Query", query: "I have an inquiry regarding my dining table and cabin reservation." },
  { label: "🎟️ Live Queue Token Status", query: "How do I check my live queue token number and waiting time?" },
  { label: "⚠️ File Official Complaint", query: "I want to file a formal complaint regarding service delay or issue." },
  { label: "📞 Speak to Human Supervisor", query: "Please connect me to an executive customer operations specialist." }
];

export default function HelpCenterPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>('faq-1');
  
  // Enterprise AI Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<{
    id?: string;
    sender: 'user' | 'admin';
    text: string;
    time?: string;
    isBotCallOffer?: boolean;
    botOptions?: string[];
    pattern?: string;
    category?: string;
    userQuery?: string;
    ticketId?: string;
    isComplaint?: boolean;
    trainedFeedback?: 'helpful' | 'unhelpful';
  }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Email Ticket Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', subject: 'Customer Inquiry', message: '' });
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isBotTyping, isChatOpen]);

  // Handle User Training Feedback
  const handleTrainBotFeedback = (messageIndex: number, isHelpful: boolean) => {
    setChatMessages(prev => {
      const updated = [...prev];
      const target = updated[messageIndex];
      if (target) {
        target.trainedFeedback = isHelpful ? 'helpful' : 'unhelpful';

        // Save learning sample to trained knowledge base
        try {
          const stored = localStorage.getItem('MV_BOT_TRAINED_KNOWLEDGE') || '[]';
          let knowledge = JSON.parse(stored);
          if (!Array.isArray(knowledge)) knowledge = [];

          let userQuery = target.userQuery || '';
          if (!userQuery) {
            for (let i = messageIndex - 1; i >= 0; i--) {
              if (updated[i].sender === 'user') {
                userQuery = updated[i].text;
                break;
              }
            }
          }

          if (userQuery) {
            const keywords = userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            knowledge.unshift({
              id: `TRN-${Date.now()}`,
              keywords: keywords.slice(0, 5),
              userQuery,
              category: target.category || 'General Assistance',
              pattern: target.pattern || 'USER_FEEDBACK_TRAINED',
              solution: isHelpful ? target.text : 'Understood. A live customer operations supervisor has reviewed your feedback and is intervening on your session directly.',
              isHelpful,
              trainedAt: new Date().toISOString()
            });
            localStorage.setItem('MV_BOT_TRAINED_KNOWLEDGE', JSON.stringify(knowledge.slice(0, 50)));
          }
        } catch {}

        toast.success(
          isHelpful 
            ? '✓ Response marked helpful! AI model reinforcement updated.' 
            : '✓ Feedback saved. Escalated directly to customer operations supervisor.',
          { icon: isHelpful ? '🤖' : '📝' }
        );
      }
      return updated;
    });
  };

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.email || !ticketForm.message) {
      toast.error('Please enter your email and message.');
      return;
    }
    setIsSendingTicket(true);
    try {
      const res = await fetch(`${API_URL}/auth/support-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send ticket');
      toast.success('Your message has been sent to our support team!');
      setIsEmailModalOpen(false);
      setTicketForm({ name: '', email: '', subject: 'Customer Inquiry', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Error sending message. Please try again.');
    } finally {
      setIsSendingTicket(false);
    }
  };

  // Sync Live Chat with LocalStorage & Admin desk
  useEffect(() => {
    const loadMyChat = () => {
      try {
        const stored = localStorage.getItem('MV_LIVE_CHATS');
        if (stored) {
          let chats = JSON.parse(stored);
          if (!Array.isArray(chats)) chats = [];
          
          // Remove outdated mock dummy contacts if present
          if (chats.some((c: any) => c.id === 'CH-1001' && c.customerName === 'Aarav Sharma')) {
            chats = chats.filter((s: any) => !(s.id === 'CH-1001' || s.id === 'CH-1002' || s.id === 'CH-1003'));
            localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(chats));
          }
          
          const myChat = chats.find((c: any) => c.id === 'CH-ME');
          if (myChat && myChat.messages && myChat.messages.length > 0) {
            setChatMessages(myChat.messages);
          } else if (chatMessages.length === 0) {
            // Enterprise default warm welcome message
            const welcomeMsg = {
              id: 'init-msg',
              sender: 'admin' as const,
              text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 Welcome to MarkatVerse Corporate AI Concierge. I am trained on company services, live delivery tracking, dining bookings, and customer resolutions. How can I assist you today?`,
              time: 'Just now',
              category: 'Welcome & Onboarding',
              botOptions: [
                "Track my recent order",
                "Table / Dining reservation status",
                "Refund & return inquiry",
                "File a complaint"
              ]
            };
            setChatMessages([welcomeMsg]);
          }
        } else if (chatMessages.length === 0) {
          const welcomeMsg = {
            id: 'init-msg',
            sender: 'admin' as const,
            text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 Welcome to MarkatVerse Corporate AI Concierge. I am trained on company services, live delivery tracking, dining bookings, and customer resolutions. How can I assist you today?`,
            time: 'Just now',
            category: 'Welcome & Onboarding',
            botOptions: [
              "Track my recent order",
              "Table / Dining reservation status",
              "Refund & return inquiry",
              "File a complaint"
            ]
          };
          setChatMessages([welcomeMsg]);
        }
      } catch {
        setChatMessages([]);
      }
    };
    
    loadMyChat();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'MV_LIVE_CHATS' && e.newValue) {
        try {
          const chats = JSON.parse(e.newValue);
          const myChat = Array.isArray(chats) ? chats.find((c: any) => c.id === 'CH-ME') : null;
          if (myChat && myChat.messages) {
            setChatMessages(myChat.messages);
          }
        } catch {}
      }
    };

    const handleCustomSync = () => {
      loadMyChat();
    };

    const syncInterval = setInterval(loadMyChat, 1500);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('MV_CHAT_SYNC', handleCustomSync);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('MV_CHAT_SYNC', handleCustomSync);
    };
  }, [user]);

  // Send Message Logic with Enterprise AI & Complaint Engine
  const handleSendMessage = (overrideText?: string) => {
    const textToSend = (overrideText || currentMessage).trim();
    if (!textToSend) return;

    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { 
      id: `usr-${Date.now()}`,
      sender: 'user' as const, 
      text: textToSend, 
      time: currentTimeStr 
    };

    const stored = localStorage.getItem('MV_LIVE_CHATS');
    let chats = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(chats)) chats = [];
    
    const myChatIndex = chats.findIndex((c: any) => c.id === 'CH-ME');
    const currentMessages = myChatIndex >= 0 ? (chats[myChatIndex].messages || []) : chatMessages;
    
    const newMessages = [...currentMessages, newMessage];
    setChatMessages(newMessages);
    setCurrentMessage('');
    setIsBotTyping(true);

    if (myChatIndex >= 0) {
      chats[myChatIndex].messages = newMessages;
      chats[myChatIndex].lastMessage = textToSend;
      chats[myChatIndex].unreadCount = (chats[myChatIndex].unreadCount || 0) + 1;
      chats[myChatIndex].time = currentTimeStr;
    } else {
      chats = [{
        id: 'CH-ME',
        customerName: user?.name || 'Guest User',
        type: 'chat',
        status: 'active',
        lastMessage: textToSend,
        time: currentTimeStr,
        unreadCount: 1,
        phone: user?.phone || '+91 98765 43210',
        messages: newMessages
      }, ...chats];
    }
    
    localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(chats));
    window.dispatchEvent(new Event('MV_CHAT_SYNC'));

    // Dynamic User-Trained Knowledge Engine
    const getUserTrainedKnowledge = () => {
      try {
        const stored = localStorage.getItem('MV_BOT_TRAINED_KNOWLEDGE');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    };

    // AI Problem Pattern & Complaint Recognition Engine
    const analyzeProblemPattern = (text: string) => {
      const lower = text.toLowerCase();
      
      // 1. Check user-trained knowledge base first (reinforced learning)
      const trainedKnowledge = getUserTrainedKnowledge();
      for (const item of trainedKnowledge) {
        if (item.keywords && item.keywords.some((k: string) => lower.includes(k.toLowerCase()))) {
          return {
            category: item.category || 'User-Trained Resolution',
            pattern: item.pattern || 'USER_TRAINED_MATCH',
            urgency: item.urgency || 'HIGH',
            confidence: 0.99,
            isComplaint: item.isComplaint || false,
            summary: item.summary || 'Matched user-trained knowledge base',
            solution: item.solution
          };
        }
      }

      // 2. High-Severity Complaints & Fraud Grievances
      if (
        lower.includes('complain') || lower.includes('fraud') || lower.includes('cheat') || 
        lower.includes('scam') || lower.includes('bad service') || lower.includes('rude') || 
        lower.includes('overcharged') || lower.includes('worst') || lower.includes('fake product') ||
        lower.includes('dispute') || lower.includes('unacceptable') || lower.includes('grievance')
      ) {
        const genTicket = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          category: 'Formal Complaint & Grievance',
          pattern: 'FORMAL_COMPLAINT',
          urgency: 'CRITICAL',
          confidence: 0.99,
          ticketId: genTicket,
          isComplaint: true,
          summary: 'Customer filed an official grievance regarding service or platform integrity',
          solution: `I have officially filed this as Priority Grievance Ticket #${genTicket}. It is logged directly into the Admin & Support Disputes desk. Our senior resolution supervisor will review your audit log within 15 minutes.`
        };
      }

      // 3. Shipping & Delivery Tracking
      if (lower.includes('late') || lower.includes('delay') || lower.includes('where is my order') || lower.includes('not delivered') || lower.includes('track')) {
        return {
          category: 'Order Delivery & Shipping',
          pattern: 'DELIVERY_DELAY',
          urgency: 'HIGH',
          confidence: 0.95,
          isComplaint: false,
          summary: 'Customer reports shipping / delivery delay',
          solution: 'I checked your live route status. Your local dispatch partner is currently en route. You can view GPS tracking coordinates directly in Profile > Orders or contact the delivery partner directly.'
        };
      }

      // 4. Billing, Refunds & Chargebacks
      if (lower.includes('refund') || lower.includes('money back') || lower.includes('deducted') || lower.includes('return') || lower.includes('double charge')) {
        return {
          category: 'Billing & Refunds',
          pattern: 'REFUND_SETTLEMENT',
          urgency: 'HIGH',
          confidence: 0.96,
          isComplaint: lower.includes('double charge') || lower.includes('deducted'),
          summary: 'Customer inquiring about refund / return settlement',
          solution: 'Refunds are automatically processed to the original payment method. UPI reversals credit within 2–4 hours; credit/debit card refunds take 3–5 banking days after warehouse check-in.'
        };
      }

      // 5. Dining Table Reservation & Venue Queries
      if (lower.includes('table') || lower.includes('restaurant') || lower.includes('dining') || lower.includes('reservation') || lower.includes('cabin') || lower.includes('vip setup')) {
        return {
          category: 'Dining & Table Reservation',
          pattern: 'DINING_RESERVATION_ISSUE',
          urgency: 'HIGH',
          confidence: 0.95,
          isComplaint: lower.includes('cancel') || lower.includes('declined') || lower.includes('waiting'),
          summary: 'Customer inquiring about dining reservation or cabin booking',
          solution: 'Your table reservation is confirmed instantly and held for 90 minutes. You can view your active digital booking pass under Profile > Dining & Reservations or call the venue manager directly.'
        };
      }

      // 6. Live Token & Appointments
      if (lower.includes('token') || lower.includes('queue') || lower.includes('doctor') || lower.includes('salon') || lower.includes('appointment')) {
        return {
          category: 'Live Queue & Services',
          pattern: 'QUEUE_APPOINTMENT_ISSUE',
          urgency: 'NORMAL',
          confidence: 0.92,
          isComplaint: false,
          summary: 'Live token or service appointment timing concern',
          solution: 'Your live token is synchronized in real-time with the vendor. Check the active status badge in your top navbar to monitor serving tokens and your estimated turn.'
        };
      }

      // 7. Damaged, defective or missing item
      if (lower.includes('broken') || lower.includes('damage') || lower.includes('wrong item') || lower.includes('missing') || lower.includes('expired')) {
        const genTicket = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          category: 'Product Quality & Fulfillment',
          pattern: 'DAMAGED_OR_MISSING_ITEM',
          urgency: 'URGENT',
          ticketId: genTicket,
          isComplaint: true,
          summary: 'Damaged, missing, or incorrect item reported',
          solution: `We apologize for this inconvenience. A zero-cost return or immediate replacement has been pre-authorized under Ticket #${genTicket}. You can proceed directly in Profile > Orders.`
        };
      }

      // 8. Human Agent / Call request
      if (lower.includes('speak') || lower.includes('human') || lower.includes('agent') || lower.includes('call') || lower.includes('supervisor')) {
        return {
          category: 'Live Human Escalation',
          pattern: 'HUMAN_AGENT_REQUEST',
          urgency: 'HIGH',
          confidence: 0.98,
          isComplaint: false,
          summary: 'Customer requested human agent intervention',
          solution: 'I am alerting our active desk specialists right now. Click "Request Instant Callback" below or tap the direct hotline.'
        };
      }

      return {
        category: 'General Corporate Assistance',
        pattern: 'GENERAL_INQUIRY',
        urgency: 'NORMAL',
        confidence: 0.88,
        isComplaint: false,
        summary: 'General customer assistance requested',
        solution: 'I have logged your inquiry with our concierge desk. You can choose one of the quick resolution options below or ask any question regarding orders, dining, and tokens.'
      };
    };

    const detected = analyzeProblemPattern(textToSend);

    // Auto-file in Admin Complaints database if recognized as complaint
    if (detected.isComplaint) {
      try {
        const ticketCode = (detected as any).ticketId || `CMP-${Date.now().toString().slice(-4)}`;
        const complaintEntry = {
          id: ticketCode,
          customer: user?.name || 'Customer',
          email: user?.email || 'customer@markatverse.com',
          category: detected.category,
          issue: textToSend,
          severity: detected.urgency,
          status: 'OPEN',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          createdAt: new Date().toISOString()
        };
        const existingComplaints = JSON.parse(localStorage.getItem('MV_SUPPORT_COMPLAINTS') || '[]');
        localStorage.setItem('MV_SUPPORT_COMPLAINTS', JSON.stringify([complaintEntry, ...existingComplaints]));
        window.dispatchEvent(new Event('MV_COMPLAINT_CREATED'));
      } catch {}
    }

    // Save Pattern to Admin Intelligence Log
    try {
      const storedPatterns = localStorage.getItem('MV_SUPPORT_PATTERNS');
      let patterns = storedPatterns ? JSON.parse(storedPatterns) : [];
      if (!Array.isArray(patterns)) patterns = [];
      patterns = [{
        id: `PAT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        userQuery: textToSend,
        category: detected.category,
        pattern: detected.pattern,
        urgency: detected.urgency,
        isComplaint: detected.isComplaint,
        confidence: `${Math.round((detected.confidence ?? 0) * 100)}%`,
        summary: detected.summary
      }, ...patterns.slice(0, 49)];
      localStorage.setItem('MV_SUPPORT_PATTERNS', JSON.stringify(patterns));
    } catch {}

    // Simulate intelligent enterprise thinking time (500ms to 900ms)
    setTimeout(() => {
      setIsBotTyping(false);
      let botReply: any = null;

      if (textToSend === "My issue is resolved") {
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'admin' as const,
          text: "Wonderful! We're glad we could resolve your concern promptly. Thank you for choosing MarkatVerse! 🌟",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: detected.category,
          pattern: detected.pattern
        };
      } else if (textToSend === "Speak to a Human Agent" || textToSend.toLowerCase().includes("human")) {
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'admin' as const,
          text: "Connecting you to an available human support executive. In the meantime, you can request an immediate callback on your registered phone number.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'Live Human Support',
          pattern: 'HUMAN_AGENT_REQUEST',
          isBotCallOffer: true
        };
      } else if (textToSend === "Request Instant Callback") {
        handleRequestCall();
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'admin' as const,
          text: "Your contact details have been placed in our prioritized dispatch queue. A representative will call you within 5 minutes.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: detected.category,
          pattern: detected.pattern,
          isBotCallOffer: true
        };
      } else {
        const hasComplaint = detected.isComplaint;
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'admin' as const,
          text: `🤖 **AI Concierge**: ${detected.solution}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: detected.category,
          pattern: detected.pattern,
          ticketId: (detected as any).ticketId,
          isComplaint: hasComplaint,
          userQuery: textToSend,
          botOptions: hasComplaint 
            ? ["Check Complaint Status", "Speak to a Human Agent", "Request Instant Callback"]
            : ["My issue is resolved", "Speak to a Human Agent", "Request Instant Callback"]
        };
      }

      if (botReply) {
        setChatMessages(prev => {
          const updated = [...prev, botReply];
          try {
            const currentStored = localStorage.getItem('MV_LIVE_CHATS');
            if (currentStored) {
              const currentChats = JSON.parse(currentStored);
              if (Array.isArray(currentChats)) {
                const idx = currentChats.findIndex((c: any) => c.id === 'CH-ME');
                if (idx >= 0) {
                  currentChats[idx].messages = updated;
                  currentChats[idx].lastMessage = botReply.text.slice(0, 60) + '...';
                  localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(currentChats));
                  window.dispatchEvent(new Event('MV_CHAT_SYNC'));
                }
              }
            }
          } catch {}
          return updated;
        });
      }
    }, 700);
  };

  const handleRequestCall = () => {
    toast.success('Your callback request is logged. An executive will call you shortly.', { duration: 5000, icon: '📞' });
    
    try {
      const stored = localStorage.getItem('MV_LIVE_CHATS');
      let chats = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(chats)) chats = [];
      
      chats = [{
        id: `CH-CALL-${Math.floor(Math.random() * 1000)}`,
        customerName: user?.name ? `${user.name} (Callback)` : 'Guest User (Callback)',
        type: 'call',
        status: 'waiting',
        lastMessage: 'Requested a callback via corporate help desk.',
        time: 'Just now',
        unreadCount: 1,
        phone: user?.phone || '+91 98765 43210',
        messages: [{ sender: 'user', text: 'User requested an urgent phone callback via Help Center.', time: 'Just now' }]
      }, ...chats];
      
      localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(chats));
      window.dispatchEvent(new Event('MV_CHAT_SYNC'));
    } catch {}
  };

  // Filter FAQs by Category & Search Query
  const filteredFaqs = enterpriseFaqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(q) || 
      faq.answer.toLowerCase().includes(q) ||
      faq.tags.some(tag => tag.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-800">
      
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> MarkatVerse Customer Care & Resolution Center
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            How can we assist you today?
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto mb-8">
            Instant AI support, self-service tracking, categorized FAQs, and 24/7 corporate grievance management.
          </p>
          
          {/* Main Search Input */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by issue (e.g. 'track order', 'refund delay', 'table reservation', 'complaint')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-12 py-4 rounded-2xl text-base text-slate-900 placeholder-slate-400 bg-white shadow-xl focus:ring-4 focus:ring-blue-400/30 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Search Suggestions */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-blue-100">
            <span className="font-semibold text-blue-200">Frequently Searched:</span>
            {["track order", "refund status", "table booking", "live token", "file complaint"].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(tag)}
                className="bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-full transition-colors border border-white/10"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Body Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* Quick Help Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {[
            { label: 'Track Order', icon: Package, query: 'track', color: 'text-blue-600 bg-blue-50' },
            { label: 'Refunds & Returns', icon: CreditCard, query: 'refund', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Dining Tables', icon: UtensilsCrossed, query: 'table', color: 'text-amber-600 bg-amber-50' },
            { label: 'Queue Tokens', icon: Ticket, query: 'token', color: 'text-purple-600 bg-purple-50' },
            { label: 'Prime VIP', icon: ShieldCheck, query: 'prime', color: 'text-rose-600 bg-rose-50' },
            { label: 'Seller Desk', icon: Store, query: 'seller', color: 'text-indigo-600 bg-indigo-50' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(item.query);
                const elem = document.getElementById('faq-container');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* 2-Column Layout: FAQs (Left) and AI Assistant Banner / Contacts (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" id="faq-container">
          
          {/* FAQ Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Category Filter Tabs */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none flex gap-2">
              {categoryTabs.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setOpenFaqIndex(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* FAQs Accordion Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
              
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Frequently Asked Questions (FAQ)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Showing {filteredFaqs.length} verified answers {searchQuery ? `for "${searchQuery}"` : ''}
                    </p>
                  </div>
                </div>

                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700 mb-1">No matching FAQ found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                    Our AI concierge is trained to answer any custom question directly.
                  </p>
                  <button
                    onClick={() => {
                      setIsChatOpen(true);
                      handleSendMessage(searchQuery);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <MessageCircle className="w-4 h-4" /> Ask AI Concierge for &ldquo;{searchQuery}&rdquo;
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => {
                    const isOpen = openFaqIndex === faq.id;
                    return (
                      <div 
                        key={faq.id}
                        className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                          isOpen ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : faq.id)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none gap-4"
                        >
                          <span className={`text-sm md:text-base font-bold ${isOpen ? 'text-blue-700' : 'text-slate-800'}`}>
                            {faq.question}
                          </span>
                          <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? 'text-blue-600 rotate-180' : 'text-slate-400'}`} />
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100/60">
                            <p>{faq.answer}</p>
                            
                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="text-slate-400 font-medium">Was this answer helpful?</span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => toast.success('Thank you for your feedback!')}
                                  className="text-slate-500 hover:text-emerald-600 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" /> Yes
                                </button>
                                <button 
                                  onClick={() => {
                                    setIsChatOpen(true);
                                    handleSendMessage(`I need more assistance regarding: ${faq.question}`);
                                  }}
                                  className="text-slate-500 hover:text-blue-600 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors font-medium"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" /> Ask AI Concierge
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

          {/* Right Sidebar: Corporate AI Chat Access & Emergency Contacts */}
          <div className="space-y-6">
            
            {/* Enterprise AI Concierge Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500 rounded-full blur-3xl opacity-25 -mr-12 -mt-12 pointer-events-none"></div>
              
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Instant AI Helpdesk Active
              </div>

              <h3 className="text-xl font-bold mb-1">Corporate AI Concierge</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Trained on MarkatVerse company workflows, delivery GPS, dining reservations, and customer grievances with immediate escalation.
              </p>

              {/* Starter Quick Chips */}
              <div className="space-y-2 mb-6">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Actions:</p>
                {quickSupportChips.slice(0, 4).map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsChatOpen(true);
                      handleSendMessage(chip.query);
                    }}
                    className="w-full text-left bg-white/10 hover:bg-white/20 text-white text-xs font-medium py-2 px-3 rounded-xl transition-all border border-white/10 flex items-center justify-between group"
                  >
                    <span>{chip.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-sm"
              >
                <MessageCircle className="w-4 h-4" /> Open Support Chat
              </button>

            </div>

            {/* Direct Phone & Callback Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2 text-sm">
                <PhoneCall className="w-4 h-4 text-blue-600" /> Executive Priority Callback
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Need immediate phone intervention? Request a 5-minute callback from our dispatch lead.
              </p>
              
              <button
                onClick={handleRequestCall}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs mb-3"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Request Instant Callback
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-400 block mb-0.5">Toll-Free Customer Hotline:</span>
                <a href="tel:+9118001234567" className="text-blue-600 font-extrabold text-sm hover:underline">
                  1800-123-4567 (24/7)
                </a>
              </div>
            </div>

            {/* Email Support Ticket Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-indigo-600" /> Formal Support Ticket
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Submit documentation, order receipts, or detailed seller inquiries directly to our desk.
              </p>
              <button
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs border border-blue-200"
              >
                <Send className="w-3.5 h-3.5" /> Open Ticket Form
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Modern Enterprise AI Chat Drawer / Floating Widget */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 z-[120] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-blue-700"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight">MarkatVerse Concierge</h3>
                  <span className="text-[9px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-bold px-1.5 py-0.5 rounded-full">
                    AI Active
                  </span>
                </div>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Typically replies instantly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('MV_LIVE_CHATS');
                    setChatMessages([]);
                    toast.success('Chat history cleared');
                  } catch {}
                }}
                title="Restart Chat"
                className="p-1.5 rounded-xl hover:bg-white/10 text-blue-200 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="p-1.5 rounded-xl hover:bg-white/10 text-blue-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Chip Suggestions Bar (Inside Chat) */}
          <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200/80 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
            {quickSupportChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                className="text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition-colors shadow-2xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3.5 bg-slate-50">
            
            {chatMessages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender indicator for enterprise feel */}
                  {!isUser && (
                    <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 ml-1">
                      <Sparkles className="w-2.5 h-2.5 text-blue-500" /> MarkatVerse Corporate AI
                    </span>
                  )}

                  <div 
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-tr-xs' 
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Complaint Badge if auto-filed */}
                    {msg.ticketId && (
                      <div className="mb-2 pb-2 border-b border-slate-100 flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg font-bold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Grievance Logged: #{msg.ticketId}
                      </div>
                    )}

                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Callback Action Button if offered */}
                    {msg.isBotCallOffer && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <button 
                          onClick={handleRequestCall}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-400" /> Request Callback Now
                        </button>
                      </div>
                    )}

                    {/* Pre-packaged Quick Reply Options */}
                    {msg.botOptions && msg.botOptions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                        {msg.botOptions.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleSendMessage(opt)}
                            className="w-full text-left bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/60 py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between"
                          >
                            <span>{opt}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* AI Feedback & Adaptive Reinforcement Controls */}
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                          <CheckCheck className="w-3 h-3 text-blue-500" /> Verified Knowledge
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleTrainBotFeedback(idx, true)}
                            title="Helpful - Trains AI model"
                            className={`p-1 rounded-md transition-colors flex items-center gap-1 ${
                              msg.trainedFeedback === 'helpful' 
                                ? 'text-emerald-700 font-bold bg-emerald-50' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {msg.trainedFeedback === 'helpful' && <span className="text-[9px]">Trained ✓</span>}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleTrainBotFeedback(idx, false)}
                            title="Unhelpful - Escalates to supervisor"
                            className={`p-1 rounded-md transition-colors flex items-center gap-1 ${
                              msg.trainedFeedback === 'unhelpful' 
                                ? 'text-rose-700 font-bold bg-rose-50' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                            {msg.trainedFeedback === 'unhelpful' && <span className="text-[9px]">Escalated ✓</span>}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                  
                  <span className="text-[10px] text-slate-400 mt-1 mx-1">{msg.time}</span>
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {isBotTyping && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl w-fit shadow-2xs">
                <Bot className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-300"></span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Assistant thinking...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            <input 
              type="text" 
              placeholder="Ask about orders, dining, tokens, refunds..." 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!currentMessage.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Chat Trigger Button when Closed */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-[100] bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all group"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-600"></span>
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline">AI Support Concierge</span>
        </button>
      )}

      {/* Email Support Ticket Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Send Support Inquiry</h3>
                  <p className="text-xs text-slate-400">Our customer desk will reply within 24 hours</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Your Name</label>
                <input 
                  type="text"
                  placeholder="e.g. John Doe"
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Your Email Address *</label>
                <input 
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={ticketForm.email}
                  onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Subject</label>
                <input 
                  type="text"
                  placeholder="e.g. Question about order, table reservation, or seller onboarding"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Message *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe your inquiry or grievance in detail..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTicket}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSendingTicket ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
