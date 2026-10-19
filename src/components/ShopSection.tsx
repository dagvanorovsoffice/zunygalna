'use client';

import React, { useState } from 'react';
import { Language } from '@/lib/i18n';
import {
  ShoppingBag,
  Scale,
  Dumbbell,
  Utensils,
  Sparkles,
  Check,
  Plus,
  ShoppingCart,
  ShieldCheck,
} from 'lucide-react';

interface ShopItem {
  id: string;
  category: 'portion' | 'fitness' | 'nutrition';
  titleMn: string;
  titleEn: string;
  descMn: string;
  descEn: string;
  impactNoteMn: string;
  impactNoteEn: string;
  priceMnt: number;
  badgeMn: string;
  badgeEn: string;
  imageUrl: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'kitchen-scale-1g',
    category: 'portion',
    titleMn: 'Ухаалаг гал тогооны жин (1г нарийвчлалтай)',
    titleEn: 'Precision Metric Kitchen Scale (1g — 5000g)',
    descMn:
      'Зун яг ална аппын 60г будаа, 90г үхрийн мах, 120г ногоо зэрэг граммын жорыг яг таг хэмжих зориулалттай.',
    descEn:
      'Measure your exact 60g white rice, 90g lean beef, and 120g vegetables in seconds with 1g precision.',
    impactNoteMn: 'Хоолны илчлэгийн алдааг 35%-иар бууруулна',
    impactNoteEn: 'Reduces hidden portion calorie creep by 35%',
    priceMnt: 35000,
    badgeMn: 'Хамгийн эрэлттэй',
    badgeEn: 'Best Seller',
    imageUrl:
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'portion-plate-211',
    category: 'portion',
    titleMn: '2:1:1 Харьцаатай Хэмжүүрт Таваг ба Савны Багц',
    titleEn: '2:1:1 Asian Portion Control Plate & Bento Box',
    descMn:
      'Тавагны 50% ногоо, 25% уураг (мах/өндөг), 25% нүүрс ус (будаа/гурил) байхаар хуваарилагдсан.',
    descEn:
      'Divided metric meal prep container: 50% vegetables, 25% lean protein, 25% complex carbs.',
    impactNoteMn: 'Жин хэмжигчгүй үед ч нүдэн баримжаагаар зөв иднэ',
    impactNoteEn: 'Automatic portion balance at work or home',
    priceMnt: 42000,
    badgeMn: 'Ажил руу авч явахад тохиромжтой',
    badgeEn: 'Office Lunch Favorite',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'smart-body-scale',
    category: 'fitness',
    titleMn: 'Биеийн Бүтэц Хэмжигч Ухаалаг Жин (Өөх % + Булчин кг)',
    titleEn: 'Smart BIA Body Composition Scale (Fat % & Muscle kg)',
    descMn:
      'Зөвхөн нийт жин биш өөхний хувь, араг ясны булчингийн жин, дотор өөхний түвшинг хэмжинэ.',
    descEn:
      'Tracks body fat %, skeletal muscle mass (kg), and visceral fat for your Body Recomposition goals.',
    impactNoteMn: 'Булчин нэмж, өөх шатаах явцыг бодитоор хянана',
    impactNoteEn: 'Essential for tracking fat loss vs. muscle gain',
    priceMnt: 89000,
    badgeMn: 'Зуны зорилгод',
    badgeEn: 'Summer Goal Essential',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'resistance-bands-set',
    category: 'fitness',
    titleMn: 'Гэрийн Хүчний Бэлтгэлийн Резинэн Туузны Багц (5 түвшин)',
    titleEn: '5-Level Home Resistance Band Set (5kg – 45kg)',
    descMn:
      'Гэртээ эсвэл оффис дээрээ 15 минут булчин чангалах дасгал хийж суурь бодисын солилцоо (BMR)-г нэмэгдүүлнэ.',
    descEn:
      'Build lean muscle at home in 15 mins/day to raise your resting metabolic burn (BMR).',
    impactNoteMn: '+1 кг булчин = өдөрт +20–30 ккал нэмэлт шаталт',
    impactNoteEn: 'Preserves lean muscle while in a calorie deficit',
    priceMnt: 48000,
    badgeMn: 'Гэрийн дасгал',
    badgeEn: 'Home Workout',
    imageUrl:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'step-tracker-band',
    category: 'fitness',
    titleMn: 'Алхалт ба Илчлэг Тоологч Хөнгөн Бугуйвч',
    titleEn: 'Lightweight Step, Distance (km/m) & Calorie Band',
    descMn:
      'Өдрийн алхсан метр, километр болон шатаасан илчлэгийг хэмжиж Баг уралдаанд тэргүүлэхэд тусална.',
    descEn:
      'Tracks daily walking distance in meters & kilometers for your Team Linear Journey.',
    impactNoteMn: 'Өдөрт +3,000 алхам нэмэх дадлыг хэвшүүлнэ',
    impactNoteEn: 'Helps hit your daily active km goal consistently',
    priceMnt: 95000,
    badgeMn: 'Баг уралдаан',
    badgeEn: 'Team Race Gear',
    imageUrl:
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'whey-isolate-pack',
    category: 'nutrition',
    titleMn: 'Цэвэр Уургийн Багц (1 порц = 25г уураг, 110 ккал)',
    titleEn: 'Clean Lean Protein Pack (25g Protein, 0g Added Sugar)',
    descMn:
      'Илчлэгийн алдагдалтай үед булчингаа хамгаалах сахаргүй, өөх тос багатай уургийн нэмэлт.',
    descEn:
      'Zero added sugar protein supplement to hit your 1.6g/kg daily protein target effortlessly.',
    impactNoteMn: 'Өлсгөлөн мэдрэмжийг дарж булчингийн алдагдлаас сэргийлнэ',
    impactNoteEn: 'Keeps you full and protects lean muscle mass',
    priceMnt: 125000,
    badgeMn: 'Сахаргүй 0г',
    badgeEn: '0g Sugar',
    imageUrl:
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=700&q=80',
  },
];

interface ShopSectionProps {
  lang: Language;
}

export default function ShopSection({ lang }: ShopSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'portion' | 'fitness' | 'nutrition'
  >('all');
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [orderSuccessToast, setOrderSuccessToast] = useState(false);

  const filteredItems =
    selectedCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === selectedCategory);

  const toggleCartItem = (id: string) => {
    setCartIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalCartMnt = cartIds.reduce((sum, id) => {
    const found = SHOP_ITEMS.find((i) => i.id === id);
    return sum + (found ? found.priceMnt : 0);
  }, 0);

  return (
    <div className="space-y-8 pb-8">
      {/* SHOP HEADER BANNER */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border border-emerald-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'mn' ? 'Зун яг ална • Дэлгүүр' : 'Zunygalna • Smart Health Shop'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {lang === 'mn'
                ? 'Зуны зорилтдоо хүрэхэд туслах ухаалаг хэрэгслүүд'
                : 'Tools to Make Daily Portion Control & Movement Effortless'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {lang === 'mn'
                ? 'Граммын нарийвчлалтай жин, 2:1:1 харьцаатай таваг, болон гэрийн дасгалын хэрэгслүүд нь өдөр тутмын жижиг үйлдлийг хялбарчилна.'
                : 'Curated metric kitchen scales, portion plates, and home fitness essentials selected to support your June 15th transformation.'}
            </p>
          </div>

          {/* Cart Summary Pill */}
          <div className="rounded-2xl bg-white border-2 border-emerald-400 p-4 shadow-xs min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                {lang === 'mn' ? 'Таны сагс' : 'Your Cart'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                {cartIds.length}
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {totalCartMnt.toLocaleString()} ₮
            </div>
            {cartIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setOrderSuccessToast(true);
                  setTimeout(() => setOrderSuccessToast(false), 4000);
                }}
                className="mt-2.5 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs cursor-pointer transition-colors"
              >
                {lang === 'mn' ? 'Захиалга баталгаажуулах' : 'Checkout Order'}
              </button>
            )}
          </div>
        </div>

        {orderSuccessToast && (
          <div className="mt-4 rounded-2xl bg-emerald-600 text-white px-4 py-3 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {lang === 'mn'
                ? 'Таны захиалгын хүсэлт бүртгэгдлээ! Бид тантай удахгүй холбогдох болно.'
                : 'Order request received! Our team will contact you shortly for delivery.'}
            </span>
            <button
              type="button"
              onClick={() => setOrderSuccessToast(false)}
              className="underline ml-4 cursor-pointer"
            >
              OK
            </button>
          </div>
        )}
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          {
            id: 'all',
            labelMn: 'Бүгд',
            labelEn: 'All Essentials',
            icon: <Sparkles className="w-3.5 h-3.5" />,
          },
          {
            id: 'portion',
            labelMn: 'Грамм хэмжүүр ба Сав',
            labelEn: 'Metric Scales & Plates',
            icon: <Scale className="w-3.5 h-3.5" />,
          },
          {
            id: 'fitness',
            labelMn: 'Дасгал ба Алхалт',
            labelEn: 'Fitness & Walk Gear',
            icon: <Dumbbell className="w-3.5 h-3.5" />,
          },
          {
            id: 'nutrition',
            labelMn: 'Сахаргүй Уураг ба Нэмэлт',
            labelEn: 'Clean Protein & Nutrition',
            icon: <Utensils className="w-3.5 h-3.5" />,
          },
        ].map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setSelectedCategory(
                  tab.id as 'all' | 'portion' | 'fitness' | 'nutrition'
                )
              }
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 border transition-all cursor-pointer ${
                active
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {tab.icon}
              <span>{lang === 'mn' ? tab.labelMn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const inCart = cartIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={lang === 'mn' ? item.titleMn : item.titleEn}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/95 text-emerald-800 border border-emerald-200 shadow-xs">
                    {lang === 'mn' ? item.badgeMn : item.badgeEn}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {lang === 'mn' ? item.titleMn : item.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'mn' ? item.descMn : item.descEn}
                  </p>
                  <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-3 py-2 text-[11px] font-bold text-emerald-800">
                    💡 {lang === 'mn' ? item.impactNoteMn : item.impactNoteEn}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {lang === 'mn' ? 'Үнэ' : 'Price'}
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {item.priceMnt.toLocaleString()} ₮
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCartItem(item.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    inCart
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                      : 'bg-slate-900 hover:bg-emerald-600 text-white border-slate-900'
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>{lang === 'mn' ? 'Сагсанд орсон' : 'Added'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'mn' ? 'Сагсанд нэмэх' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
