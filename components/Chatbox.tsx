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

// Cơ sở tri thức sản phẩm
const PRODUCT_DATABASE = {
    iphone16Pro: {
        name: 'iPhone 16 Pro/Pro Max',
        price: '28.990.000đ - 43.990.000đ',
        chip: 'A18 Pro',
        screen: '6.3" / 6.9" ProMotion 120Hz',
        camera: '48MP chính + 48MP Ultra Wide + 12MP Telephoto 5x',
        colors: ['Titan Tự Nhiên', 'Titan Sa Mạc', 'Titan Trắng', 'Titan Đen'],
        features: ['Khung Titan', 'Nút Camera Control', 'Apple Intelligence', 'USB-C 3.0']
    },
    iphone16: {
        name: 'iPhone 16/Plus',
        price: '22.990.000đ - 27.990.000đ',
        chip: 'A18',
        screen: '6.1" / 6.7" Super Retina XDR',
        camera: '48MP Fusion + 12MP Ultra Wide',
        colors: ['Đen', 'Trắng', 'Hồng', 'Xanh Ultramarine', 'Xanh Lá'],
        features: ['Khung nhôm', 'Nút Action + Camera Control', 'Ceramic Shield']
    },
    airpodsPro2: {
        name: 'AirPods Pro 2',
        price: '6.990.000đ',
        features: ['Chống ồn chủ động', 'Audio không gian', 'Sạc USB-C', 'Thời lượng 6h']
    },
    appleWatch: {
        name: 'Apple Watch Series 10',
        price: '10.990.000đ - 18.990.000đ',
        features: ['Màn hình lớn hơn', 'Cảm biến sức khỏe', 'Chống nước 50m']
    }
}

// Engine AI thông minh với NLP nâng cao
class SmartChatbotEngine {
    private context: {
        lastEntity?: string;
        lastIntent?: string;
        userPreferences?: { product?: string; budget?: string };
    } = {}

    private readonly KNOWLEDGE_BASE = {
        delivery: {
            hn_hcm: 'Giao siêu tốc 2h',
            provincial: '2-3 ngày làm việc',
            fee: 'Miễn phí cho đơn hàng trên 1tr',
            info: '📦 **Thông tin giao hàng:**\n• Nội thành HN/HCM: Nhận hàng trong 2h.\n• Toàn quốc: 2-4 ngày qua GHTK/Viettel Post.\n• Phí ship: Đồng giá 30k, free ship đơn >1tr.'
        },
        warranty: {
            duration: '12 tháng chính hãng Apple',
            exchange: '1 đổi 1 trong 30 ngày đầu',
            centers: 'Bảo hành tại tất cả TTBH Ủy quyền Apple (AASP) toàn quốc.',
            info: '🛡️ **Chính sách bảo hành:**\n• 12 tháng chính hãng Apple VN.\n• 1 đổi 1 trong 30 ngày nếu phát hiện lỗi phần cứng từ NSX.\n• Hỗ trợ phần mềm trọn đời máy.'
        },
        installment: {
            credit: '0% lãi suất qua thẻ tín dụng (Visa/Master/JCB)',
            finance: 'Trả góp qua Home Credit/HD Saison (Chỉ cần CCCD)',
            prepaid: 'Trả trước từ 20-50%',
            info: '💳 **Trả góp ưu đãi:**\n• 0% lãi suất qua thẻ tín dụng (25 ngân hàng).\n• Trả góp duyệt hồ sơ online trong 15p.\n• Chỉ cần CCCD gắn chip.'
        },
        tradeIn: {
            bonus: 'Trợ giá lên đến 2.000.000đ',
            process: 'Định giá máy cũ nhanh trong 5p tại cửa hàng.',
            info: '♻️ **Thu cũ đổi mới:**\n• Thu mua mọi dòng iPhone/Android cũ.\n• Trợ giá thêm 1-2 triệu khi lên đời iPhone 16.\n• Thủ tục bù chênh lệch hoặc trả góp phần còn lại.'
        }
    }

    // Phân tích ý định người dùng
    analyzeIntent(message: string): { intent: string; entities: string[]; confidence: number } {
        const msg = message.toLowerCase().trim()
        const entities: string[] = []

        // Detect product mentions
        if (msg.includes('iphone 16 pro') || msg.includes('pro max') || msg.includes('16pm')) entities.push('iphone16Pro')
        else if (msg.includes('iphone 16') || msg.includes('plus')) entities.push('iphone16')
        else if (msg.includes('iphone 15')) entities.push('iphone15')

        if (msg.includes('airpods') || msg.includes('tai nghe')) entities.push('airpods')
        if (msg.includes('watch') || msg.includes('đồng hồ')) entities.push('appleWatch')

        // Context override: if user asks a general question after a specific product
        if (entities.length === 0 && this.context.lastEntity) {
            entities.push(this.context.lastEntity)
        }

        // Detect intent
        const intents = [
            { pattern: /(giá|bao nhiêu|tiền|cost|price|đắt không)/i, intent: 'price', confidence: 0.95 },
            { pattern: /(màu|color|mầu|ngoại hình|bảng màu)/i, intent: 'color', confidence: 0.95 },
            { pattern: /(so sánh|khác gì|tốt hơn|compare|vs)/i, intent: 'compare', confidence: 0.9 },
            { pattern: /(tính năng|feature|thông số|specs|màn hình|chip|ram)/i, intent: 'features', confidence: 0.9 },
            { pattern: /(trả góp|góp|hàng tháng|installment)/i, intent: 'installment', confidence: 0.95 },
            { pattern: /(khuyến mãi|giảm giá|sale|ưu đãi|quà)/i, intent: 'promotion', confidence: 0.9 },
            { pattern: /(tư vấn|khuyên|nên mua|lựa chọn)/i, intent: 'recommend', confidence: 0.8 },
            { pattern: /(camera|chụp ảnh|quay phim|zoom)/i, intent: 'camera', confidence: 0.9 },
            { pattern: /(pin|battery|sạc|charging|dung lượng)/i, intent: 'battery', confidence: 0.9 },
            { pattern: /(ship|giao hàng|bao lâu|địa chỉ|cửa hàng)/i, intent: 'delivery', confidence: 0.9 },
            { pattern: /(bảo hành|lỗi|hỏng|warranty|sửa)/i, intent: 'warranty', confidence: 0.9 },
            { pattern: /(thu cũ|đổi mới|trade in|lên đời)/i, intent: 'trade_in', confidence: 0.9 },
            { pattern: /(muốn mua|đặt hàng|chốt|order|buy|mua|lấy máy|mua ngay|giá chốt|cho mình đặt|có sẵn.*lấy)/i, intent: 'purchase', confidence: 0.95 },
        ]

        let detected = { intent: 'general', entities, confidence: 0.5 }
        for (const { pattern, intent, confidence } of intents) {
            if (pattern.test(msg)) {
                detected = { intent, entities, confidence }
                break
            }
        }

        // Update context
        if (entities[0]) this.context.lastEntity = entities[0]
        this.context.lastIntent = detected.intent

        return detected
    }

    // Tạo câu trả lời thông minh
    generateResponse(userMessage: string): { text: string; suggestions?: string[] } {
        const { intent, entities } = this.analyzeIntent(userMessage)
        const msg = userMessage.toLowerCase()

        // 0. Purchase Intent
        if (intent === 'purchase') {
            if (entities.includes('iphone16Pro')) {
                return {
                    text: `Tuyệt vời! iPhone 16 Pro là sự lựa chọn đẳng cấp nhất. Bạn có muốn mình hỗ trợ **đặt hàng online** giao tận nhà trong 2h, hay bạn muốn ghé cửa hàng trải nghiệm trước? 🛍️`,
                    suggestions: ['Đặt hàng online', 'Tìm cửa hàng gần nhất', 'Tư vấn thêm về trả góp']
                }
            }
            if (entities.includes('iphone16')) {
                return {
                    text: `iPhone 16 bản tiêu chuẩn đang rất "hot" với bảng màu trẻ trung. Bạn đã chọn được màu nào chưa? Mình có thể giúp bạn làm thủ tục giữ hàng ngay! ✨`,
                    suggestions: ['Xem bảng màu 16', 'Làm thủ tục mua ngay', 'Có quà tặng gì không?']
                }
            }
            return {
                text: `Rất vui khi bạn quan tâm đến sản phẩm của chúng tôi! Bạn đang muốn "chốt" model nào để mình kiểm tra kho và báo giá chính xác nhất? 🍎`,
                suggestions: ['iPhone 16 Pro Max', 'iPhone 16 bản thường', 'Phụ kiện Apple']
            }
        }

        // 1. Delivery & Store info
        if (intent === 'delivery') {
            return {
                text: this.KNOWLEDGE_BASE.delivery.info,
                suggestions: ['Bảo hành thế nào?', 'Có trả góp không?', 'Địa chỉ ở đâu?']
            }
        }

        // 2. Warranty info
        if (intent === 'warranty') {
            return {
                text: this.KNOWLEDGE_BASE.warranty.info,
                suggestions: ['Chắc chắn hàng chính hãng?', 'Cần mang theo gì?', 'Đổi trả ra sao?']
            }
        }

        // 3. Trade-in info
        if (intent === 'trade_in') {
            return {
                text: this.KNOWLEDGE_BASE.tradeIn.info,
                suggestions: ['iPhone 13 đổi lên được bao nhiêu?', 'Thủ tục thế nào?', 'Có lấy máy luôn không?']
            }
        }

        // 4. Installment info
        if (intent === 'installment') {
            return {
                text: this.KNOWLEDGE_BASE.installment.info,
                suggestions: ['Lãi suất 0% thật không?', 'Trả trước 0đ được không?', 'Cần giấy tờ gì?']
            }
        }

        // 5. Product Price & Details
        if (intent === 'price') {
            if (entities.includes('iphone16Pro')) {
                return {
                    text: `**Bảng giá iPhone 16 Pro/Pro Max:**\n\n• 16 Pro: Từ **28.990.000đ**\n• 16 Pro Max: Từ **34.990.000đ**\n\nGiá bán có thể thấp hơn nếu bạn áp dụng voucher hoặc Thu cũ đổi mới lên đến 2 triệu đồng! 💸`,
                    suggestions: ['Xem các màu', 'So sánh Specs', 'Tính góp 12 tháng']
                }
            }
            if (entities.includes('iphone16')) {
                return {
                    text: `**iPhone 16 Series giá cực tốt:**\n\n• iPhone 16: Chỉ từ **22.990.000đ**\n• iPhone 16 Plus: Chỉ từ **25.990.000đ**\n\nMẫu này đang có sẵn rất nhiều màu đẹp! Bạn muốn mình tư vấn màu không? 🌈`,
                    suggestions: ['Bảng màu mới 16', 'Pin dùng bao lâu?', 'Mua kèm phụ kiện']
                }
            }
        }

        // 5.1 Color Consultation (New/Improved)
        if (intent === 'color') {
            if (entities.includes('iphone16Pro')) {
                return {
                    text: `🎨 **Bảng màu iPhone 16 Pro/Pro Max:**\n\n• **Titan Sa Mạc (Desert Titanium):** Màu HOT nhất năm nay, sang trọng và độc bản.\n• **Titan Tự Nhiên:** Đẳng cấp, bền bỉ qua thời gian.\n• **Titan Trắng & Titan Đen:** Hai màu cơ bản nhưng cực kỳ tinh tế.\n\nBạn thích sự nổi bật của Titan Sa Mạc hay vẻ tối giản của Titan Đen?`,
                    suggestions: ['Xem ảnh Titan Sa Mạc', 'Giá bản Titan Đen', 'So sánh với 16 thường']
                }
            }
            if (entities.includes('iphone16')) {
                return {
                    text: `🌈 **Bảng màu iPhone 16/16 Plus cực trẻ trung:**\n\n• **Ultramarine:** Xanh dương đậm mới lạ, cực kỳ bắt mắt.\n• **Teal:** Xanh lục dịu nhẹ, thanh lịch.\n• **Pink:** Hồng pastel ngọt ngào.\n• **White & Black:** Luôn là lựa chọn an toàn và sạch sẽ.\n\nHiện tại màu **Ultramarine** đang là xu hướng đó! Bạn thấy sao?`,
                    suggestions: ['Đặt màu Ultramarine', 'Xem màu Pink', 'Tính trả góp máy này']
                }
            }
            return {
                text: 'Bạn muốn mình tư vấn màu sắc cho dòng máy nào? iPhone 16 Pro sang trọng với khung Titan hay iPhone 16 trẻ trung với nhiều lựa chọn màu sắc? 🎨',
                suggestions: ['Màu iPhone 16 Pro', 'Màu iPhone 16 thường']
            }
        }

        // 6. Battery info
        if (intent === 'battery') {
            if (entities.includes('iphone16Pro')) {
                return {
                    text: `🔋 **Thời lượng Pin iPhone 16 Pro Max:**\n\nXem video lên đến **33 giờ** - Trâu nhất lịch sử iPhone! Bản 16 Pro cũng đạt 27 giờ. Cả hai đều hỗ trợ sạc MagSafe 25W mới rất nhanh.`,
                    suggestions: ['Sạc có kèm máy không?', 'Mua củ sạc 30W', 'Pin bản thường thì sao?']
                }
            }
            return {
                text: 'Dòng iPhone 16 năm nay đều được cải tiến pin đáng kể, trung bình tăng 2-4 tiếng sử dụng so với iPhone 15. Bạn yên tâm dùng cả ngày nhé! 🔋',
                suggestions: ['So sánh pin cụ thể', 'Sạc nhanh bao lâu?']
            }
        }

        // 7. Feature/Spec info
        if (intent === 'features') {
            if (entities.includes('iphone16Pro')) {
                return {
                    text: `🌟 **Apple Intelligence** là tâm điểm của iPhone 16 Pro, giúp bạn tóm tắt văn bản, tạo Genmoji và Siri thông minh hơn. Ngoài ra Nút **Camera Control** giúp bạn điều chỉnh tiêu cự, zoom chỉ bằng cách lướt ngón tay!`,
                    suggestions: ['Camera Control dùng sao?', 'Chip A18 Pro mạnh không?', 'Màn hình 120Hz']
                }
            }
        }

        // 8. Recommend / Consult
        if (intent === 'recommend') {
            if (msg.includes('game') || msg.includes('chủ game')) {
                return {
                    text: `🎮 **Dành cho Game thủ:**\nKhông gì qua được **iPhone 16 Pro Max**. Chip A18 Pro có Ray Tracing nhanh hơn 20%, màn hình 6.9 inch cực lớn và tản nhiệt graphene mới giúp máy mát hơn khi leo rank!`,
                    suggestions: ['Đặt cọc ngay', 'Giá bản 256GB', 'Tay cầm chơi game']
                }
            }
            if (msg.includes('livestream') || msg.includes('quay') || msg.includes('tiktok')) {
                return {
                    text: `🎬 **Dành cho Content Creator:**\nBạn nên chọn dòng Pro để có tính năng **Audio Mix** (tách tiếng ồn studio) và quay phim **4K 120fps**. Chất lượng phim như máy điện ảnh chuyên nghiệp luôn! 🎥`,
                    suggestions: ['Tư vấn mic đi kèm', 'Thẻ nhớ lưu trữ', 'Giá 512GB']
                }
            }
        }

        // General greetings & Fallback
        if (/^(hi|hello|chào|xin chào|hey|alo)/i.test(msg)) {
            return {
                text: `Chào bạn! Mình là AI tư vấn chuyên sâu của Apple Store 👋\n\nBạn cần hỗ trợ gì về **iPhone 16**, **Trả góp 0%**, hay **Thu cũ đổi mới** không? Mình luôn sẵn sàng!`,
                suggestions: ['iPhone 16 Pro có gì mới?', 'Tính giá iPhone 16', 'Địa chỉ cửa hàng']
            }
        }

        return {
            text: `Xin lỗi, mình chưa hiểu rõ yêu cầu. Bạn có thể hỏi về:\n\n• **Giá** các dòng máy\n• Chi tiết **Pin & Camera**\n• Thủ tục **Trả góp/Thu cũ**\n• Chính sách **Ship hàng 2h**\n\nHoặc để lại số điện thoại để nhân viên gọi lại tư vấn nhé! �`,
            suggestions: ['Giá iPhone 16 Pro', 'Ship hàng 2h', 'Trả góp 0%']
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