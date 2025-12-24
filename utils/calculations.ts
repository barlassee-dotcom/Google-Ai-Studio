
import { Asset, Check, RecurringRule, Transaction, FlowPeriod, ProjectionType, Currency } from '../types';

export const formatMoney = (n: number, currency: Currency = 'TL') => {
  return n.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency: currency === 'TL' ? 'TRY' : 'EUR'
  });
};

export const toLocalYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getNextBusinessDay = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 6) d.setDate(d.getDate() + 2); // Cumartesi -> Pazartesi
  else if (day === 0) d.setDate(d.getDate() + 1); // Pazar -> Pazartesi
  return d;
};

export const calculateBoschDate = (d: Date) => {
  let temp = new Date(d);
  temp.setHours(0, 0, 0, 0);
  const day = temp.getDay();
  // Bosch kuralı: Perşembe/Cuma ödemeleri Perşembe, diğerleri sonraki Pazartesi
  if (day === 4) { /* Perşembe - Olduğu gibi kalsın */ } 
  else if (day === 5) { temp.setDate(temp.getDate() - 1); } // Cuma -> Perşembe
  else if (day === 6) { temp.setDate(temp.getDate() + 2); } // Cumartesi -> Pazartesi
  else if (day === 0) { temp.setDate(temp.getDate() + 1); } // Pazar -> Pazartesi
  else if (day === 1) { /* Pazartesi - Olduğu gibi kalsın */ } 
  else if (day === 2) { temp.setDate(temp.getDate() - 1); } // Salı -> Pazartesi
  else if (day === 3) { temp.setDate(temp.getDate() - 2); } // Çarşamba -> Pazartesi
  return temp;
};

export const generateRecurringTransactions = (rules: RecurringRule[] = [], start: Date, end: Date): Transaction[] => {
  const generated: Transaction[] = [];
  const safeRules = rules || [];
  
  safeRules.forEach(rule => {
    const ruleStartDate = new Date(rule.startDate);
    ruleStartDate.setHours(0, 0, 0, 0);
    // Tekrarlı işlemler bugünden önce başlayamaz
    const loopStart = new Date(Math.max(start.getTime(), ruleStartDate.getTime()));
    let d = new Date(loopStart);
    d.setHours(0, 0, 0, 0);

    const endStr = toLocalYMD(end);

    while (toLocalYMD(d) <= endStr) {
      let isMatch = false;
      if (rule.freq === 'weekly' && rule.weekDays) {
        let jsDay = d.getDay();
        let normalizedDay = jsDay === 0 ? 7 : jsDay;
        if (rule.weekDays.includes(normalizedDay)) isMatch = true;
      } else if (rule.freq === 'monthly') {
        if (rule.monthType === 'fixed' && rule.fixedDay) {
          const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
          const targetDay = Math.min(rule.fixedDay, lastDayOfMonth);
          if (d.getDate() === targetDay) isMatch = true;
        } else if (rule.monthType === 'special' && rule.specialDay && rule.specialOrd) {
          const desiredDay = parseInt(rule.specialDay);
          const ord = parseInt(rule.specialOrd);
          let targetDate: Date | null = null;
          
          if (ord === 5) {
            const lastDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            for (let k = 0; k < 7; k++) {
              let temp = new Date(lastDate);
              temp.setDate(temp.getDate() - k);
              if (temp.getDay() === (desiredDay === 7 ? 0 : desiredDay)) { targetDate = temp; break; }
            }
          } else {
            let count = 0;
            for (let k = 1; k <= 31; k++) {
              let temp = new Date(d.getFullYear(), d.getMonth(), k);
              if (temp.getMonth() !== d.getMonth()) break;
              if (temp.getDay() === (desiredDay === 7 ? 0 : desiredDay)) {
                count++;
                if (count === ord) { targetDate = temp; break; }
              }
            }
          }
          if (targetDate && targetDate.getDate() === d.getDate()) isMatch = true;
        }
      }

      if (isMatch) {
        generated.push({
          id: `rec-${rule.id}-${toLocalYMD(d)}`,
          date: toLocalYMD(d),
          desc: rule.desc,
          amount: rule.amount,
          type: rule.type,
          currency: 'TL'
        });
      }
      d.setDate(d.getDate() + 1);
    }
  });
  return generated;
};

export const calculateFlow = (
  projectionType: ProjectionType,
  assets: Asset[] = [],
  checks: Check[] = [],
  manualTransactions: Transaction[] = [],
  recurringRules: RecurringRule[] = [],
  eurRate: number,
  viewCurrency: Currency
): FlowPeriod[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toLocalYMD(today);
  
  const periods: FlowPeriod[] = [];
  let endDate = new Date(today);
  
  // Projeksiyon periyotlarını oluştur
  if (projectionType === 'daily') {
    endDate.setDate(today.getDate() + 45);
    for (let i = 0; i <= 45; i++) {
      let d = new Date(today);
      d.setDate(today.getDate() + i);
      periods.push({
        start: new Date(d),
        end: new Date(d),
        label: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' }),
        incomes: 0,
        expenses: 0,
        balance: 0,
        details: {}
      });
    }
  } else if (projectionType === 'weekly') {
    endDate.setDate(today.getDate() + (12 * 7));
    let current = new Date(today);
    for (let i = 0; i < 12; i++) {
      let weekEnd = new Date(current);
      const day = current.getDay();
      const diff = 7 - (day === 0 ? 7 : day);
      weekEnd.setDate(current.getDate() + diff);
      weekEnd.setHours(23, 59, 59, 999);
      periods.push({
        start: new Date(current),
        end: new Date(weekEnd),
        label: `${current.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}`,
        incomes: 0,
        expenses: 0,
        balance: 0,
        details: {}
      });
      current = new Date(weekEnd);
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    }
  } else {
    endDate.setMonth(today.getMonth() + 6);
    let current = new Date(today);
    current.setDate(1);
    for (let i = 0; i < 6; i++) {
      let monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      periods.push({
        start: new Date(current),
        end: new Date(monthEnd),
        label: current.toLocaleString('tr-TR', { month: 'long', year: 'numeric' }),
        incomes: 0,
        expenses: 0,
        balance: 0,
        details: {}
      });
      current = new Date(monthEnd);
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    }
  }

  // Başlangıç bakiyesi (Sadece dahil edilen varlıklar)
  let initialBalance = 0;
  (assets || []).filter(a => a.included).forEach(a => {
    let amt = a.amount;
    if (viewCurrency === 'TL' && a.currency === 'EUR') amt *= eurRate;
    else if (viewCurrency === 'EUR' && a.currency === 'TL') amt /= eurRate;
    initialBalance += amt;
  });

  // GEÇMİŞ VERİLERİ FİLTRELE: Sadece bugün veya daha sonrası
  const allTrans: Transaction[] = (manualTransactions || []).filter(t => t.date >= todayStr);
  
  (checks || []).forEach(c => {
    if (c.effectiveDateStr >= todayStr) {
      allTrans.push({
        id: c.id,
        date: c.effectiveDateStr,
        desc: `ÇEK: ${c.desc}`,
        amount: c.amount,
        type: 'income',
        currency: 'TL'
      });
    }
  });

  // Tekrarlı işlemler bugünden itibaren üretilir
  allTrans.push(...generateRecurringTransactions(recurringRules, today, endDate));

  let runningBalance = initialBalance;

  periods.forEach(p => {
    const pStartStr = toLocalYMD(p.start);
    const pEndStr = toLocalYMD(p.end);

    const periodTrans = allTrans.filter(t => {
      return t.date >= pStartStr && t.date <= pEndStr;
    });

    periodTrans.forEach(t => {
      let val = t.amount;
      if (viewCurrency === 'TL' && t.currency === 'EUR') val *= eurRate;
      else if (viewCurrency === 'EUR' && t.currency === 'TL') val /= eurRate;

      if (t.type === 'income') {
        p.incomes += val;
      } else {
        p.expenses += val;
      }
      p.details[t.desc] = (p.details[t.desc] || 0) + (t.type === 'income' ? val : -val);
    });

    runningBalance += (p.incomes - p.expenses);
    p.balance = runningBalance;
  });

  return periods;
};
