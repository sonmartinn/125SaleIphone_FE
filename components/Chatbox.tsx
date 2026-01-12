'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Loader2, ChevronRight, Sparkles } from 'lucide-react'

interface Message {
    id: string
    text: string
    sender: 'bot' | 'user'
    timestamp: Date
    isLoading?: boolean
    suggestions?: string[]
}

// Cơ sở tri thức sản phẩm (Chỉ iPhone & Phụ kiện)
const PRODUCT_DATABASE = {
    iphone16Pro: {
        name: 'iPhone 16 Pro/Pro Max',
        price: '28.990.000đ - 46.990.000đ',
        specs: 'Chip A18 Pro, Camera Fusion 48MP, Nút Camera Control, Pin 33h video',
        colors: ['Titan Sa Mạc', 'Titan Tự Nhiên', 'Titan Trắng', 'Titan Đen']
    },
    iphone16: {
        name: 'iPhone 16/Plus',
        price: '22.990.000đ - 25.990.000đ',
        specs: 'Chip A18, Camera 48MP, Nút Action, Apple Intelligence',
        colors: ['Ultramarine', 'Teal', 'Pink', 'White', 'Black']
    },
    iphone15: {
        name: 'iPhone 15 Series',
        price: '18.990.000đ - 28.990.000đ',
        specs: 'Chip A17 Pro (Pro models), Dynamic Island, USB-C',
        colors: ['Titan Tự Nhiên', 'Blue', 'Green', 'Yellow', 'Pink']
    },
    airpods: {
        name: 'AirPods Pro 2 (USB-C)',
        price: '5.990.000đ',
        specs: 'Chống ồn chủ động 2x, Âm thanh thích ứng, Chống bụi/nước IP54'
    },
    charger: {
        name: 'Củ sạc 20W/35W chính hãng',
        price: '500.000đ - 1.200.000đ',
        specs: 'Sạc nhanh PD, Bảo vệ quá dòng, Tương thích mọi dòng iPhone'
    },
    case: {
        name: 'Ốp lưng MagSafe',
        price: '800.000đ - 1.500.000đ',
        specs: 'Silicon/FineWoven, Hỗ trợ sạc MagSafe, Chống sốc chuẩn quân đội'
    }
}

// Engine AI thông minh với NLP nâng cao
class SmartChatbotEngine {
    private context: {
        lastEntity?: string;
        lastIntent?: string;
        step?: string; // Để tracking luồng hội thoại (ví dụ: đang hỏi màu -> hỏi dung lượng -> chốt đơn)
    } = {}

    private readonly KNOWLEDGE_BASE = {
        delivery: {
            info: '📦 **Giao hàng siêu tốc:**\n• Nội thành HN/HCM: Nhận trong 2h (Grab/Ahamove).\n• Tỉnh thành khác: 2-3 ngày (GHTK/Viettel).\n• Freeship đơn > 1 triệu.'
        },
        warranty: {
            info: '🛡️ **Bảo hành 1 đổi 1:**\n• 30 ngày đầu: Lỗi NSX đổi máy mới ngay.\n• 12 tháng: Bảo hành chính hãng tại tất cả AASP ở Việt Nam.'
        },
        installment: {
            info: '💳 **Trả góp 0% lãi suất:**\n• Qua thẻ tín dụng (25 ngân hàng).\n• Qua HomeCredit/Mcredit: Trả trước 30%, duyệt 15 phút, chỉ cần CCCD.'
        }
    }

    // Phân tích ý định người dùng
    analyzeIntent(message: string): { intent: string; entities: string[]; confidence: number } {
        const msg = message.toLowerCase().trim()
        const entities: string[] = []

        // 1. Detect Products
        if (/iphone 16 pro|pro max|16pm|sa mạc|titan/i.test(msg)) entities.push('iphone16Pro')
        else if (/iphone 16|16 plus|16 thường|ultramarine|teal/i.test(msg)) entities.push('iphone16')
        else if (/iphone 15|15 pro|15 plus/i.test(msg)) entities.push('iphone15')
        else if (/airpods|tai nghe/i.test(msg)) entities.push('airpods')
        else if (/sạc|củ sạc|dây sạc/i.test(msg)) entities.push('charger')
        else if (/ốp|bao da|kính|cường lực/i.test(msg)) entities.push('case')

        // Context override
        if (entities.length === 0 && this.context.lastEntity) {
            // Nếu người dùng hỏi câu tiếp theo mà k nhắc tên sp, dùng context cũ
            // Trừ khi họ hỏi về danh mục khác hẳn
            if (!/phụ kiện|khác|dòng nào/i.test(msg)) {
                entities.push(this.context.lastEntity)
            }
        }

        // 2. Detect Intent
        // Ưu tiên các keyword từ Suggestion Button để map chính xác
        const intents = [
            { pattern: /(giá|bao nhiêu|tiền|báo giá)/i, intent: 'price' },
            { pattern: /(màu|color|xem|titan|sa mạc|tự nhiên|trắng|đen|hồng|xanh|ultramarine|teal|pink|white|black)/i, intent: 'color' },
            { pattern: /(dung lượng|gb|bộ nhớ|lưu trữ|128gb|256gb|512gb|1tb)/i, intent: 'storage' },
            { pattern: /(chụp ảnh|quay phim|camera|sống ảo|selfie)/i, intent: 'photography' },
            { pattern: /(cấu hình|chip|ram|pin|thông số|specs)/i, intent: 'specs' },
            { pattern: /(trả góp|góp|lãi suất|giấy tờ|hồ sơ)/i, intent: 'installment' },
            { pattern: /(mua|đặt|chốt|lấy|ship|giao|cửa hàng|địa chỉ|thông tin)/i, intent: 'purchase' },
            { pattern: /(bảo hành|đổi trả|lỗi)/i, intent: 'warranty' },
            { pattern: /(phụ kiện|accessories|đồ chơi|mua kèm)/i, intent: 'accessories' },
            { pattern: /(tư vấn|nên mua|khuyên|help|nhân viên|hỗ trợ)/i, intent: 'consult' },
            { pattern: /(cảm ơn|thanks|thank|ok|oke|ok nhe|tks|hihi|haha)/i, intent: 'thanks' }
        ]

        let detectedIntent = 'general'
        // Check suggestions direct mapping first
        if (msg.includes('đặt') || msg.includes('mua') || msg.includes('chốt') || msg.includes('thông tin đặt hàng')) detectedIntent = 'purchase'
        else if (msg.includes('giá') || msg.includes('bao nhiêu')) detectedIntent = 'price'
        else if (msg.includes('màu') || msg.includes('xem') || msg.includes('titan')) detectedIntent = 'color'
        else if (msg.includes('tư vấn') || msg.includes('hỗ trợ') || msg.includes('nhân viên')) detectedIntent = 'consult'
        else if (msg.includes('phụ kiện') || msg.includes('mua kèm')) detectedIntent = 'accessories'
        else if (msg.includes('dung lượng') || msg.includes('gb') || msg.includes('bộ nhớ')) detectedIntent = 'storage'
        else if (msg.includes('chụp') || msg.includes('camera')) detectedIntent = 'photography'
        else if (msg.includes('so sánh')) detectedIntent = 'specs'
        else if (msg.includes('giấy tờ') || msg.includes('hồ sơ')) detectedIntent = 'installment'
        else if (/(cảm ơn|thanks|tks|ok|oke)/i.test(msg)) detectedIntent = 'thanks'
        else {
            for (const { pattern, intent } of intents) {
                if (pattern.test(msg)) {
                    detectedIntent = intent
                    break
                }
            }
        }

        // Update context
        if (entities[0]) this.context.lastEntity = entities[0]
        this.context.lastIntent = detectedIntent

        return { intent: detectedIntent, entities, confidence: 1 }
    }

    // Tạo câu trả lời
    generateResponse(userMessage: string): { text: string; suggestions?: string[] } {
        const { intent, entities } = this.analyzeIntent(userMessage)
        const entityKey = entities[0] as keyof typeof PRODUCT_DATABASE
        const product = PRODUCT_DATABASE[entityKey]

        // 1. Hỏi về Giá (Price)
        if (intent === 'price') {
            if (product) {
                return {
                    text: `💰 **Giá ${product.name}** hiện tại:\n${product.price}\n\nĐang có ưu đãi giảm thêm 500k khi thanh toán chuyển khoản! Bạn muốn xem màu hay đặt luôn?`,
                    suggestions: [`Xem màu ${product.name}`, `Đặt ${product.name}`, 'Trả góp thế nào?']
                }
            }
            return {
                text: 'Bạn đang quan tâm giá của dòng iPhone nào? 16 Series mới ra mắt hay 15 Series giá tốt?',
                suggestions: ['Giá iPhone 16 Pro Max', 'Giá iPhone 16 thường', 'Giá iPhone 15']
            }
        }

        // 2. Hỏi về Dung lượng (Storage)
        if (intent === 'storage') {
            return {
                text: `💾 **Tư vấn dung lượng phù hợp:**\n\n• **128GB:** Đủ dùng cơ bản (Lưu trữ ảnh/app ít).\n• **256GB:** Thoải mái chụp ảnh, quay video 4K (Khuyên dùng 👍).\n• **512GB/1TB:** Dành cho Creator quay ProRes hoặc lưu trữ "khủng".\n\nBạn dự định dùng máy để làm gì là chính?`,
                suggestions: ['Lấy bản 256GB', 'Giá bản 128GB', 'Chốt 512GB cho thoải mái']
            }
        }

        // 3. Hỏi về Chụp ảnh/Camera (Photography)
        if (intent === 'photography') {
            return {
                text: `📸 **Thánh sống ảo là đây!**\n\n**iPhone 16 Pro Max** chấp hết các loại máy ảnh:\n• Camera Fusion 48MP siêu nét.\n• Zoom quang 5x tia cực tím.\n• Nút **Camera Control** trượt để zoom chuyên nghiệp.\n\nBạn có muốn xem ảnh chụp thử không?`,
                suggestions: ['Xem ảnh chụp thử', 'So sánh cam 15 Pro', 'Lấy 16 Pro Max màu Sa Mạc']
            }
        }

        // 4. Hỏi về Specs/Cấu hình
        if (intent === 'specs') {
            if (product) {
                return {
                    text: `⚡ **Thông số nổi bật của ${product.name}:**\n• ${product.specs}\n\nMáy cực mạnh, pin trâu. Bạn có muốn xem ảnh thực tế các màu không?`,
                    suggestions: [`Xem màu ${product.name}`, 'So sánh với bản cũ', `Giá ${product.name}`]
                }
            }
        }

        // 5. Hỏi về Màu sắc
        if (intent === 'color') {
            if (product && 'colors' in product) {
                return {
                    text: `🎨 **Các màu tùy chọn:**\n${(product as any).colors.join(', ')}\n\nMàu **${(product as any).colors[0]}** đang hot nhất đó ạ. Bạn thích màu nào?`,
                    suggestions: [`Lấy màu ${(product as any).colors[0]}`, 'Xem giá chi tiết', 'Tư vấn dung lượng']
                }
            }
        }

        // 6. Mua hàng / Giao hàng
        if (intent === 'purchase') {
            if (product) {
                return {
                    text: `Tuyệt vời! Bạn chốt **${product.name}** phải không? ✨\nBạn có thể để lại SĐT tại đây hoặc liên hệ hotline bên mình để được ưu tiên lên đơn ngay nhé! 👇`,
                    suggestions: ['0912.345.678 (Hotline)', 'Chat Zalo Shop', 'Xem lại giá']
                }
            }
            return {
                text: 'Bạn muốn đặt mua sản phẩm nào ạ? iPhone hay Phụ kiện?',
                suggestions: ['Đặt iPhone 16 Pro Max', 'Mua sạc 20W', 'Mua ốp lưng']
            }
        }

        // 7. Trả góp
        if (intent === 'installment') {
            return {
                text: this.KNOWLEDGE_BASE.installment.info,
                suggestions: ['Tính lãi suất', 'Làm hồ sơ ngay', 'Chat tư vấn']
            }
        }

        // 8. Bảo hành
        if (intent === 'warranty') {
            return {
                text: this.KNOWLEDGE_BASE.warranty.info,
                suggestions: ['Địa chỉ bảo hành', 'Lỗi màn hình có đổi k?']
            }
        }

        // 9. Tư vấn phụ kiện
        if (intent === 'accessories') {
            return {
                text: `🎧 **Thế giới phụ kiện Apple chính hãng:**\n\n• **AirPods Pro 2:** Chống ồn chủ động 2x, âm thanh vòm.\n• **Củ sạc 20W/35W:** Sạc nhanh PD, bảo vệ pin.\n• **Ốp lưng MagSafe:** Đa dạng màu sắc, chống sốc chuẩn quân đội.\n\nBạn cần mình tư vấn món nào?`,
                suggestions: ['Giá AirPods Pro 2', 'Mua củ sạc 20W', 'Xem các mẫu ốp lưng']
            }
        }

        // 10. Tư vấn chung / Mặc định
        if (intent === 'consult' || userMessage.includes('tư vấn')) {
            return {
                text: 'Mình sẵn sàng tư vấn! Bạn phân vân giữa dòng Pro và thường, hay muốn tìm thiết bị phù hợp ngân sách?',
                suggestions: ['So sánh 16 và 16 Pro', 'Các dòng iPhone giá rẻ', 'Ngân sách 20tr mua gì?']
            }
        }

        // 11. Cảm ơn
        if (intent === 'thanks') {
            return {
                text: 'Rất vui được hỗ trợ bạn! 🥰\nCần thêm thông tin gì cứ nhắn mình nhé. Chúc bạn một ngày tốt lành!',
                suggestions: ['Xem iPhone 16 Pro Max', 'Phụ kiện HOT', 'Địa chỉ cửa hàng']
            }
        }

        // General greetings & Fallback
        if (/^(hi|hello|chào|xin chào|hey|alo)/i.test(userMessage)) {
            return {
                text: `Chào bạn! Mình là AI tư vấn chuyên sâu của Apple Store 👋\n\nBạn cần hỗ trợ gì về **iPhone 16**, **Trả góp 0%**, hay **Thu cũ đổi mới** không? Mình luôn sẵn sàng!`,
                suggestions: ['iPhone 16 Pro có gì mới?', 'Tính giá iPhone 16', 'Địa chỉ cửa hàng']
            }
        }

        // Fallback catch-all
        return {
            text: 'Chào bạn, mình là AI Assistant chuyên về iPhone & Phụ kiện 🍎.\nBạn cần tìm hiểu về **iPhone 16 Series** mới nhất hay các dòng **iPhone 15** giá tốt?',
            suggestions: ['Giá iPhone 16 Pro Max', 'Xem iPhone 15', 'Phụ kiện chính hãng']
        }
    }
}

const AdvancedChatbot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Chào bạn! Mình là **AI tư vấn thông minh** của Apple Store 🤖✨\n\nMình được đào tạo để hiểu và tư vấn chi tiết về các sản phẩm Apple. Hỏi mình bất cứ điều gì nhé!',
            sender: 'bot',
            timestamp: new Date(),
            suggestions: ['Tư vấn iPhone 16', 'Xem chương trình trả góp', 'So sánh các model']
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatEngine = useRef(new SmartChatbotEngine())

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion)
        // Auto send after a brief moment
        setTimeout(() => {
            handleSendMessage(undefined, suggestion)
        }, 100)
    }

    const handleSendMessage = async (e?: React.FormEvent, directMessage?: string) => {
        e?.preventDefault()
        const messageText = directMessage || inputValue
        if (!messageText.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInputValue('')

        // Loading state
        const loadingMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: '',
            sender: 'bot',
            timestamp: new Date(),
            isLoading: true
        }
        setMessages(prev => [...prev, loadingMsg])

        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))

        // Generate AI response
        const response = chatEngine.current.generateResponse(messageText)

        // Remove loading and add real response
        setMessages(prev => prev.filter(m => !m.isLoading))

        const botMsg: Message = {
            id: (Date.now() + 2).toString(),
            text: response.text,
            sender: 'bot',
            timestamp: new Date(),
            suggestions: response.suggestions
        }
        setMessages(prev => [...prev, botMsg])
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 dark:border-zinc-800 dark:bg-zinc-950 sm:w-[420px]">
                    {/* Header */}
                    <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 text-white">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                        <div className="relative flex items-center gap-3">
                            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-sm">
                                <Sparkles className="h-6 w-6 text-yellow-300" />
                                <div className="absolute inset-0 animate-ping rounded-full bg-white/20"></div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">AI Assistant Pro</h3>
                                <div className="flex items-center gap-1.5 text-[10px] opacity-90">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                    <span>Powered by Smart Engine</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="relative rounded-full p-2 transition-colors hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-50 to-white p-4 space-y-4 dark:from-zinc-950 dark:to-zinc-900">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
                                        : 'bg-white text-zinc-800 rounded-tl-sm border border-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'
                                        }`}
                                >
                                    {msg.isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                            <span className="text-zinc-500 dark:text-zinc-400">Đang phân tích...</span>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                                            __html: msg.text
                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                        }} />
                                    )}
                                </div>

                                {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {msg.suggestions.map((sug, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSuggestionClick(sug)}
                                                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-all hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900"
                                            >
                                                {sug}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <span className="mt-1 text-[10px] text-zinc-400">
                                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="relative flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Hỏi AI bất cứ điều gì..."
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-12 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-blue-500 dark:focus:bg-zinc-900"
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue.trim()}
                                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="mt-2 text-center text-[10px] text-zinc-400">
                            ⚡ Smart AI Engine • Offline Mode
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen
                    ? 'rotate-90 scale-90 bg-zinc-800 dark:bg-zinc-700'
                    : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'
                    }`}
            >
                <div className="absolute inset-0 animate-pulse rounded-full bg-white/20 opacity-0 group-hover:opacity-100"></div>
                {isOpen ? (
                    <X className="relative h-7 w-7 text-white" />
                ) : (
                    <>
                        <MessageSquare className="relative h-7 w-7 text-white" />
                        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-bounce" />
                    </>
                )}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                        AI
                    </span>
                )}
            </button>
        </div>
    )
}

export default AdvancedChatbot