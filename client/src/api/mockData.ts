// src/api/mockData.ts
import type { Product } from "./products"

export const mockProducts: Product[] = [
    {
        id: 1,
        title: "斗破苍穹",
        price: 39.9,
        rate: 4.8,
        description: "天蚕土豆的经典玄幻小说，讲述少年萧炎的成长之路",
        cover: "src/assets/pic/dp.webp",
        detail: "这里是详细的商品描述，包含小说的完整介绍、作者信息、出版背景等",
        specifications: [
            { item: "作者", value: "天蚕土豆" },
            { item: "出版社", value: "起点中文网" },
            { item: "出版时间", value: "2011-05-01" },
            { item: "ISBN", value: "9787530216789" },
            { item: "页数", value: "328" }
        ],
        category: "玄幻",
        likes: 1250,
        sales: 1250,
        score: 4.8,
        score_num: 890
    },
    {
        id: 2,
        title: "三体",
        price: 45.0,
        rate: 4.9,
        description: "刘慈欣的科幻巨著，中国科幻文学的里程碑作品",
        cover: "src/assets/pic/threebody.jpg",
        detail: "三体三部曲的第一部，讲述地球文明与三体文明的接触与冲突",
        specifications: [
            { item: "作者", value: "刘慈欣" },
            { item: "出版社", value: "重庆出版社" },
            { item: "出版时间", value: "2008-01-01" },
            { item: "ISBN", value: "9787536692930" },
            { item: "页数", value: "302" }
        ],
        category: "科幻",
        likes: 980,
        sales: 980,
        score: 4.9,
        score_num: 756
    },
    {
        id: 3,
        title: "凡人修仙传",
        price: 42.5,
        rate: 4.7,
        description: "忘语创作的仙侠小说，平凡少年的修仙传奇",
        cover: "src/assets/pic/frxxz.jpeg",
        detail: "一个普通山村小子，偶然下进入到当地江湖小门派，成了一名记名弟子",
        specifications: [
            { item: "作者", value: "忘语" },
            { item: "出版社", value: "起点中文网" },
            { item: "出版时间", value: "2009-02-14" },
            { item: "ISBN", value: "9787530216796" },
            { item: "页数", value: "415" }
        ],
        category: "玄幻",
        likes: 876,
        sales: 876,
        score: 4.7,
        score_num: 623
    },
    {
        id: 4,
        title: "流浪地球",
        price: 38.0,
        rate: 4.6,
        description: "刘慈欣短篇小说集，包含多部经典科幻作品",
        cover: "src/assets/pic/lldq.jpeg",
        detail: "收录了刘慈欣的多部经典短篇科幻小说",
        specifications: [
            { item: "作者", value: "刘慈欣" },
            { item: "出版社", value: "江苏凤凰文艺出版社" },
            { item: "出版时间", value: "2016-06-01" },
            { item: "ISBN", value: "9787539978810" },
            { item: "页数", value: "278" }
        ],
        category: "科幻",
        likes: 654,
        sales: 654,
        score: 4.6,
        score_num: 512
    },
    {
        id: 5,
        title: "星辰变",
        price: 41.8,
        rate: 4.7,
        description: "我吃西红柿的玄幻力作，讲述秦羽的修真之路",
        cover: "src/assets/pic/xcb.jpg",
        detail: "一部背景极大的奇幻修真小说",
        specifications: [
            { item: "作者", value: "我吃西红柿" },
            { item: "出版社", value: "起点中文网" },
            { item: "出版时间", value: "2007-08-01" },
            { item: "ISBN", value: "9787530216802" },
            { item: "页数", value: "389" }
        ],
        category: "玄幻",
        likes: 743,
        sales: 743,
        score: 4.7,
        score_num: 598
    },
    {
        id: 6,
        title: "球状闪电",
        price: 36.5,
        rate: 4.5,
        description: "刘慈欣的科幻小说，探索量子物理的奥秘",
        cover: "src/assets/pic/qzsd.jpg",
        detail: "对球状闪电的研究引发的一系列奇异事件",
        specifications: [
            { item: "作者", value: "刘慈欣" },
            { item: "出版社", value: "四川科学技术出版社" },
            { item: "出版时间", value: "2005-06-01" },
            { item: "ISBN", value: "9787536455382" },
            { item: "页数", value: "265" }
        ],
        category: "科幻",
        likes: 532,
        sales: 532,
        score: 4.5,
        score_num: 421
    },
    {
        id: 7,
        title: "诛仙",
        price: 44.2,
        rate: 4.8,
        description: "萧鼎创作的仙侠经典，张小凡的修真传奇",
        cover: "src/assets/pic/zx.jpg",
        detail: "天地不仁，以万物为刍狗！",
        specifications: [
            { item: "作者", value: "萧鼎" },
            { item: "出版社", value: "朝华出版社" },
            { item: "出版时间", value: "2005-06-01" },
            { item: "ISBN", value: "9787505414693" },
            { item: "页数", value: "402" }
        ],
        category: "玄幻",
        likes: 1123,
        sales: 1123,
        score: 4.8,
        score_num: 834
    },
    {
        id: 8,
        title: "超新星纪元",
        price: 34.8,
        rate: 4.4,
        description: "刘慈欣的科幻小说，孩子们统治的世界",
        cover: "src/assets/pic/cxxjy.jpeg",
        detail: "一场超新星爆发后，地球上只剩下13岁以下的孩子",
        specifications: [
            { item: "作者", value: "刘慈欣" },
            { item: "出版社", value: "作家出版社" },
            { item: "出版时间", value: "2003-01-01" },
            { item: "ISBN", value: "9787506327740" },
            { item: "页数", value: "298" }
        ],
        category: "科幻",
        likes: 421,
        sales: 421,
        score: 4.4,
        score_num: 345
    },
    {
        id: 9,
        title: "盘龙",
        price: 43.6,
        rate: 4.7,
        description: "我吃西红柿的西方玄幻小说，林雷的成长故事",
        cover: "src/assets/pic/pl.png",
        detail: "大小的血睛鬃毛狮，力大无穷的紫睛金毛猿，毁天灭地的九头蛇皇",
        specifications: [
            { item: "作者", value: "我吃西红柿" },
            { item: "出版社", value: "起点中文网" },
            { item: "出版时间", value: "2008-05-01" },
            { item: "ISBN", value: "9787530216819" },
            { item: "页数", value: "376" }
        ],
        category: "玄幻",
        likes: 897,
        sales: 897,
        score: 4.7,
        score_num: 678
    },
    {
        id: 10,
        title: "时间移民",
        price: 37.9,
        rate: 4.5,
        description: "刘慈欣科幻小说作品集",
        cover: "src/assets/pic/sjymrr.jpg",
        detail: "收录了刘慈欣的多部中短篇科幻小说",
        specifications: [
            { item: "作者", value: "刘慈欣" },
            { item: "出版社", value: "江苏凤凰文艺出版社" },
            { item: "出版时间", value: "2014-12-01" },
            { item: "ISBN", value: "9787539978834" },
            { item: "页数", value: "312" }
        ],
        category: "科幻",
        likes: 389,
        sales: 389,
        score: 4.5,
        score_num: 298
    },
    {
        id: 11,
        title: "惊悚乐园",
        price: 40.5,
        rate: 4.6,
        description: "三天两觉的虚拟世界",
        cover: "src/assets/pic/jsly.jpg",
        detail: "这是一场超越维度的游戏，亦是一场追求真理的竞逐……欢迎来到，惊悚乐园！",
        specifications: [
            { item: "作者", value: "三天两觉" },
            { item: "出版社", value: "湖北少年儿童出版社" },
            { item: "出版时间", value: "2011-07-01" },
            { item: "ISBN", value: "9787535358984" },
            { item: "页数", value: "365" }
        ],
        category: "魔幻",
        likes: 765,
        sales: 765,
        score: 4.6,
        score_num: 587
    },
    {
        id: 12,
        title: "天启预报",
        price: 35.2,
        rate: 4.3,
        description: "风月的长篇奇幻小说",
        cover: "src/assets/pic/tqyb.jpeg",
        detail: "现境之外的边境，日常之后的异常，天文会，绿日、黄金黎明、存世余孽与诸界天敌……",
        specifications: [
            { item: "作者", value: "风月" },
            { item: "出版社", value: "四川科学技术出版社" },
            { item: "出版时间", value: "2015-06-01" },
            { item: "ISBN", value: "9787536465435" },
            { item: "页数", value: "287" }
        ],
        category: "奇幻",
        likes: 298,
        sales: 298,
        score: 4.3,
        score_num: 234
    },
    {
        id: 13,
        title: "超神机械师",
        price: 46.8,
        rate: 4.6,
        description: "齐佩甲所构筑的奇幻世界",
        cover: "src/assets/pic/csjxs.png",
        detail: "战舰列队纵横星海，星辰机甲夭矫如龙，幽能炮毁天灭地，还有无边无际的机械大军，静静待在随身仓库里。",
        specifications: [
            { item: "作者", value: "齐佩甲" },
            { item: "出版社", value: "湖南人民出版社" },
            { item: "出版时间", value: "2013-07-01" },
            { item: "ISBN", value: "9787543881592" },
            { item: "页数", value: "398" }
        ],
        category: "奇幻",
        likes: 689,
        sales: 689,
        score: 4.6,
        score_num: 512
    },
    {
        id: 14,
        title: "轮回乐园",
        price: 32.9,
        rate: 4.4,
        description: "蚊子科幻短篇小说",
        cover: "src/assets/pic/lhly.jpeg",
        detail: "弑神戮魔，斩尽不死不灭",
        specifications: [
            { item: "作者", value: "文字" },
            { item: "出版社", value: "长江文艺出版社" },
            { item: "出版时间", value: "2012-08-01" },
            { item: "ISBN", value: "9787535457398" },
            { item: "页数", value: "245" }
        ],
        category: "科幻",
        likes: 456,
        sales: 456,
        score: 4.4,
        score_num: 367
    },
    {
        id: 15,
        title: "斗罗大陆",
        price: 44.5,
        rate: 4.8,
        description: "唐家三少的玄幻小说，唐三的魂师之路",
        cover: "src/assets/pic/tjss.jpeg",
        detail: "唐门外门弟子唐三，因偷学内门绝学为唐门所不容",
        specifications: [
            { item: "作者", value: "唐家三少" },
            { item: "出版社", value: "太白文艺出版社" },
            { item: "出版时间", value: "2009-05-01" },
            { item: "ISBN", value: "9787806806242" },
            { item: "页数", value: "412" }
        ],
        category: "玄幻",
        likes: 1342,
        sales: 1342,
        score: 4.8,
        score_num: 956
    },
    {
        id: 16,
        title: "全频带阻塞干扰",
        price: 33.6,
        rate: 4.3,
        description: "刘慈欣军事科幻小说",
        cover: "src/assets/pic/qp.jpeg",
        detail: "描述了一场未来战争的军事科幻作品",
        specifications: [
            { item: "作者", value: "刘慈欣" },
            { item: "出版社", value: "东方出版社" },
            { item: "出版时间", value: "2010-03-01" },
            { item: "ISBN", value: "9787506037826" },
            { item: "页数", value: "278" }
        ],
        category: "科幻",
        likes: 324,
        sales: 324,
        score: 4.3,
        score_num: 256
    },
    {
        id: 17,
        title: "神墓",
        price: 42.3,
        rate: 4.7,
        description: "辰东的玄幻小说，辰南的复活与征战",
        cover: "src/assets/pic/sm.jpg",
        detail: "一个死去万载岁月的平凡青年从远古神墓中复活而出",
        specifications: [
            { item: "作者", value: "辰东" },
            { item: "出版社", value: "中国戏剧出版社" },
            { item: "出版时间", value: "2007-04-01" },
            { item: "ISBN", value: "9787104026634" },
            { item: "页数", value: "388" }
        ],
        category: "玄幻",
        likes: 987,
        sales: 987,
        score: 4.7,
        score_num: 723
    },
    {
        id: 18,
        title: "镜子",
        price: 34.1,
        rate: 4.2,
        description: "刘慈欣科幻小说",
        cover: "src/assets/pic/jz.jpg",
        detail: "通过一面镜子看到过去未来的故事",
        specifications: [
            { item: "作者", value: "刘慈欣" },
            { item: "出版社", value: "科幻世界杂志社" },
            { item: "出版时间", value: "2004-09-01" },
            { item: "ISBN", value: "9787536455399" },
            { item: "页数", value: "265" }
        ],
        category: "科幻",
        likes: 278,
        sales: 278,
        score: 4.2,
        score_num: 198
    },
    {
        id: 19,
        title: "完美世界",
        price: 45.7,
        rate: 4.7,
        description: "辰东的玄幻小说，石昊的成长史诗",
        cover: "src/assets/pic/wmsj.jpg",
        detail: "一粒尘可填海，一根草斩尽日月星辰，弹指间天翻地覆",
        specifications: [
            { item: "作者", value: "辰东" },
            { item: "出版社", value: "湖南少年儿童出版社" },
            { item: "出版时间", value: "2013-08-01" },
            { item: "ISBN", value: "9787535893666" },
            { item: "页数", value: "402" }
        ],
        category: "玄幻",
        likes: 834,
        sales: 834,
        score: 4.7,
        score_num: 645
    },
    {
        id: 20,
        title: "带上她的眼睛",
        price: 36.8,
        rate: 4.4,
        description: "刘慈欣科幻短篇小说集",
        cover: "src/assets/pic/dstdyj.jpeg",
        detail: "收录了刘慈欣的多部经典短篇科幻小说",
        specifications: [
            { item: "作者", value: "刘慈欣" },
            { item: "出版社", value: "人民文学出版社" },
            { item: "出版时间", value: "2004-08-01" },
            { item: "ISBN", value: "9787020176254" },
            { item: "页数", value: "295" }
        ],
        category: "科幻",
        likes: 512,
        sales: 512,
        score: 4.4,
        score_num: 412
    }
]

// 广告假数据
export const mockAdvertisements = [
    {
        id: 1,
        imgUrl: "src/assets/pic/dstdyj.jpeg",
        productId: 1
    },
    {
        id: 2,
        imgUrl: "src/assets/pic/csjxs.png",
        productId: 2
    },
    {
        id: 3,
        imgUrl: "src/assets/pic/tjss.jpeg",
        productId: 3
    }
]