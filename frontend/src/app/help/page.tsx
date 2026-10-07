"use client";
import React, { useState } from 'react';
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
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  {
    question: "How do I track my order?",
    answer: "You can track your order by going to 'My Account' > 'Orders' and clicking on the 'Track Order' button next to your recent purchase. You will also receive email and SMS updates with tracking links."
  },
  {
    question: "What is your return and refund policy?",
    answer: "We offer a 7-day hassle-free return policy for most items. If you are not satisfied, you can initiate a return from your Orders page. Refunds are processed within 3-5 business days after the returned item passes quality checks."
  },
  {
    question: "How can I cancel an order?",
    answer: "Orders can only be cancelled before they are shipped. Go to your Orders page, select the item, and click 'Cancel Order'. If the item is already shipped, you can refuse the delivery or initiate a return."
  },
  {
    question: "What is MarkatVerse Prime?",
    answer: "MarkatVerse Prime is our premium membership that offers free expedited delivery, exclusive early access to sales, and special discounts. You can subscribe from your account settings."
  },
  {
    question: "How do I become a seller?",
    answer: "Click on 'Become a Seller' in the footer or navigate to the Seller Dashboard. You'll need to provide your business details, GST/Tax information, and bank account details to get started."
  }
];

const categories = [
  { icon: Package, title: "Orders & Shipping", desc: "Track, return, or cancel orders" },
  { icon: CreditCard, title: "Payment & Refunds", desc: "Manage payment methods" },
  { icon: User, title: "Account & Settings", desc: "Update profile and preferences" },
  { icon: ShieldCheck, title: "MarkatVerse Prime", desc: "Manage your subscription" },
  { icon: Store, title: "Seller Support", desc: "Help for registered sellers" },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: 'user'|'admin', text: string, time?: string, isBotCallOffer?: boolean, botOptions?: string[]}[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  React.useEffect(() => {
    const loadMyChat = () => {
      try {
        const stored = localStorage.getItem('MV_LIVE_CHATS');
        if (stored) {
          let chats = JSON.parse(stored);
          if (!Array.isArray(chats)) chats = [];
          if (chats.some((c: any) => c.id === 'CH-1001' && c.customerName === 'Aarav Sharma')) {
            chats = chats.filter((s: any) => !(s.id === 'CH-1001' || s.id === 'CH-1002' || s.id === 'CH-1003'));
            localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(chats));
          }
          const myChat = chats.find((c: any) => c.id === 'CH-ME');
          if (myChat) {
            setChatMessages(myChat.messages || []);
          } else {
            setChatMessages([]);
          }
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
          if (myChat) {
            setChatMessages(myChat.messages || []);
          }
        } catch {}
      }
    };

    const handleCustomSync = () => {
      loadMyChat();
    };

    const syncInterval = setInterval(loadMyChat, 1000);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('MV_CHAT_SYNC', handleCustomSync);
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('MV_CHAT_SYNC', handleCustomSync);
    };
  }, []);

  const handleSendMessage = (overrideText?: string) => {
    const textToSend = overrideText || currentMessage;
    if (textToSend.trim()) {
      const newMessage = { sender: 'user' as const, text: textToSend, time: 'Just now' };
      const stored = localStorage.getItem('MV_LIVE_CHATS');
      let chats = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(chats)) chats = [];
      
      const myChatIndex = chats.findIndex((c: any) => c.id === 'CH-ME');
      
      let currentMessages = [];
      if (myChatIndex >= 0) {
        currentMessages = chats[myChatIndex].messages || [];
      }
      
      const newMessages = [...currentMessages, newMessage];
      setChatMessages(newMessages);
      setCurrentMessage('');
      
      if (myChatIndex >= 0) {
        chats[myChatIndex].messages = newMessages;
        chats[myChatIndex].lastMessage = textToSend;
        chats[myChatIndex].unreadCount = (chats[myChatIndex].unreadCount || 0) + 1;
      } else {
        chats = [{
          id: 'CH-ME',
          customerName: 'Guest User',
          type: 'chat',
          status: 'active',
          lastMessage: textToSend,
          time: 'Just now',
          unreadCount: 1,
          phone: '+91 98765 43210',
          messages: newMessages
        }, ...chats];
      }
      
      localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(chats));
      window.dispatchEvent(new Event('MV_CHAT_SYNC'));

      const userMessageCount = newMessages.filter(m => m.sender === 'user').length;
      
      // Prevent bot from replying if there's an admin message after the last user message
      const lastAdminIndex = [...newMessages].reverse().findIndex(m => m.sender === 'admin' && !m.isBotCallOffer && !m.botOptions);
      const isLiveAdminActive = lastAdminIndex >= 0 && lastAdminIndex < 3; // admin replied recently

      if (!isLiveAdminActive) {
        setTimeout(() => {
          let botReply: any = null;

          if (userMessageCount === 1) {
            botReply = { 
              sender: 'admin' as const, 
              text: "Hello! Welcome to MarkatVerse Support. Please select the category that best matches your query:",
              time: 'Just now',
              botOptions: ["Service Booking Issue", "Product Order Issue", "Convenience/Grocery", "Other"]
            };
          } else if (userMessageCount === 2) {
            if (textToSend === "Service Booking Issue") {
              botReply = { sender: 'admin' as const, text: "Are you facing issues with a professional (e.g., Plumber, Carpenter) arriving late or not responding?", time: 'Just now', botOptions: ["Pro is late/unresponsive", "Reschedule/Cancel"] };
            } else if (textToSend === "Product Order Issue") {
              botReply = { sender: 'admin' as const, text: "To track your product or report a damaged item, please visit your Profile > Orders. Do you still need to speak to someone?", time: 'Just now', botOptions: ["Yes", "No"] };
            } else if (textToSend === "Convenience/Grocery") {
              botReply = { sender: 'admin' as const, text: "We're sorry for any inconvenience with your quick delivery. Is the order delayed or are items missing?", time: 'Just now', botOptions: ["Order is Delayed", "Missing Items"] };
            } else {
              botReply = { sender: 'admin' as const, text: "I understand. I have notified our support executives about your query. If you need immediate assistance, you can request a callback.", time: 'Just now', isBotCallOffer: true };
            }
          } else if (userMessageCount >= 3) {
            if (textToSend === "No") {
               botReply = { sender: 'admin' as const, text: "Great! Let us know if you need anything else. Have a wonderful day!", time: 'Just now' };
            } else {
               botReply = { sender: 'admin' as const, text: "I apologize for the hassle. I've escalated your issue to a live MarkatVerse agent. If you'd prefer to speak on the phone, please request a callback below.", time: 'Just now', isBotCallOffer: true };
            }
          }

          if (botReply) {
            const updatedMessages = [...newMessages, botReply];
            setChatMessages(updatedMessages);
            
            try {
              const currentStored = localStorage.getItem('MV_LIVE_CHATS');
              if (currentStored) {
                const currentChats = JSON.parse(currentStored);
                if (Array.isArray(currentChats)) {
                  const idx = currentChats.findIndex((c: any) => c.id === 'CH-ME');
                  if (idx >= 0) {
                    currentChats[idx].messages = updatedMessages;
                    currentChats[idx].lastMessage = "Automated reply sent.";
                    localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(currentChats));
                    window.dispatchEvent(new Event('MV_CHAT_SYNC'));
                  }
                }
              }
            } catch {}
          }
        }, 1000);
      }
    }
  };

  const handleRequestCall = () => {
    toast.success('Your request has been received. An executive will call you shortly.', { duration: 5000, icon: '📞' });
    
    const stored = localStorage.getItem('MV_LIVE_CHATS');
    let chats = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(chats)) chats = [];
    
    chats = [{
      id: `CH-CALL-${Math.floor(Math.random() * 1000)}`,
      customerName: 'Guest User (Callback)',
      type: 'call',
      status: 'waiting',
      lastMessage: 'Requested a callback.',
      time: 'Just now',
      unreadCount: 1,
      phone: '+91 98765 43210',
      messages: [{ sender: 'user', text: 'User requested a call back. Please contact them.', time: 'Just now' }]
    }, ...chats];
    
    localStorage.setItem('MV_LIVE_CHATS', JSON.stringify(chats));
    window.dispatchEvent(new Event('MV_CHAT_SYNC'));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Hero Section */}
      <div className="bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Hi, how can we help?
          </h1>
          
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for articles, orders, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 md:py-5 border-none rounded-2xl text-lg text-slate-800 placeholder-slate-400 bg-white shadow-xl focus:ring-4 focus:ring-blue-500/30 outline-none transition-all"
            />
          </div>
          <p className="mt-4 text-blue-100 text-sm font-medium">
            Popular: <span className="underline cursor-pointer hover:text-white transition-colors">Track Order</span>, <span className="underline cursor-pointer hover:text-white transition-colors">Returns</span>, <span className="underline cursor-pointer hover:text-white transition-colors">Refund Status</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all flex flex-col items-center text-center group hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{cat.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Frequently Asked Questions</h2>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div 
                    key={idx} 
                    className={`border rounded-2xl transition-all duration-300 overflow-hidden ${openFaqIndex === idx ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <button 
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className={`font-bold ${openFaqIndex === idx ? 'text-blue-700' : 'text-slate-800'}`}>
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaqIndex === idx ? 'text-blue-600 rotate-180' : 'text-slate-400'}`} />
                    </button>
                    
                    <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === idx ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <button className="text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors flex items-center justify-center gap-1 mx-auto">
                  View All FAQs <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Support Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
              
              <h3 className="text-xl font-bold mb-2 relative z-10">Still need help?</h3>
              <p className="text-slate-300 text-sm mb-8 relative z-10">
                Our customer support team is available 24/7 to assist you with any issues.
              </p>
              
              <div className="space-y-4 relative z-10">
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-blue-600" /> Start Live Chat
                </button>
                <button 
                  onClick={handleRequestCall}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-600"
                >
                  <PhoneCall className="w-5 h-5 text-slate-300" /> Request a Call
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-slate-400" /> Direct Phone Support
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Need immediate assistance? Call our toll-free number directly.
              </p>
              <a href="tel:+9118001234567" className="text-blue-600 font-bold hover:underline flex items-center gap-2 text-lg">
                1800-123-4567
              </a>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email Support
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Send us an email and we&apos;ll get back to you within 24 hours.
              </p>
              <a href="mailto:support@markatverse.com" className="text-blue-600 font-bold hover:underline">
                support@markatverse.com
              </a>
            </div>
          </div>
          
        </div>
      </div>

      {/* Live Chat Box Overlay */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          {/* Chat Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Customer Support</h3>
                <p className="text-xs text-blue-200">Online</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-blue-200 hover:text-white transition-colors p-1 bg-blue-700/50 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="p-4 h-72 overflow-y-auto flex flex-col gap-3 bg-slate-50">
            {chatMessages.length === 0 && (
              <div className="text-center text-xs text-slate-400 my-4">
                Send a message to start a conversation.
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                  {msg.text}
                  {msg.isBotCallOffer && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <button 
                        onClick={handleRequestCall}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <PhoneCall className="w-3 h-3" /> Request a Callback Now
                      </button>
                    </div>
                  )}
                  {msg.botOptions && msg.botOptions.length > 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3 flex flex-col gap-2">
                      {msg.botOptions.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSendMessage(opt)}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2 px-3 rounded-lg text-xs font-semibold transition-colors text-left"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 mx-1">{msg.time}</span>
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
            />
            <button 
              onClick={() => handleSendMessage()}
              className="w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
