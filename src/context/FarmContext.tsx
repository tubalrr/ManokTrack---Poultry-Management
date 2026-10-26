import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import {
  Batch,
  DailyLog,
  FeedItem,
  EggCollection,
  HealthLog,
  Expense,
  Sale,
} from '../types';
import {
  INITIAL_BATCHES,
  INITIAL_FEEDS,
  INITIAL_DAILY_LOGS,
  INITIAL_EGG_COLLECTIONS,
  INITIAL_HEALTH_LOGS,
  INITIAL_EXPENSES,
  INITIAL_SALES,
} from '../data/initialData';

export interface FarmAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  linkTab?: string;
}

interface FarmContextType {
  batches: Batch[];
  dailyLogs: DailyLog[];
  feedInventory: FeedItem[];
  eggCollections: EggCollection[];
  healthLogs: HealthLog[];
  expenses: Expense[];
  sales: Sale[];
  isLoading: boolean;
  isFirebaseConnected: boolean;
  
  // Dashboard Metrics
  totalBirdsAlive: number;
  totalEggsToday: number;
  totalFeedStockKg: number;
  mortalityThisWeek: number;
  profitThisMonth: number;
  alerts: FarmAlert[];

  // Batch actions
  addBatch: (batch: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  addMortality: (batchId: string, count: number, cause: string, date?: string) => Promise<void>;
  sellBatch: (batchId: string, buyer: string, countSold: number, pricePerBird: number, notes?: string) => Promise<void>;
  transferBatch: (batchId: string, destinationNotes: string) => Promise<void>;

  // Daily Log actions
  addDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => Promise<void>;

  // Feed actions
  addFeedItem: (item: Omit<FeedItem, 'id' | 'updatedAt'>) => Promise<void>;
  restockFeed: (id: string, additionalKg: number, newPricePerKg?: number) => Promise<void>;
  calculateFCR: (batchId: string) => { totalFeedKg: number; weightGainKg: number; fcr: number };

  // Egg actions
  addEggCollection: (collection: Omit<EggCollection, 'id' | 'createdAt' | 'totalEggs'>) => Promise<void>;

  // Health actions
  addHealthLog: (log: Omit<HealthLog, 'id' | 'createdAt'>) => Promise<void>;
  completeVaccination: (id: string) => Promise<void>;

  // Finance actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;

  // Reset
  resetToDemoData: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'manoktrack_farm_state_v1';

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(INITIAL_DAILY_LOGS);
  const [feedInventory, setFeedInventory] = useState<FeedItem[]>(INITIAL_FEEDS);
  const [eggCollections, setEggCollections] = useState<EggCollection[]>(INITIAL_EGG_COLLECTIONS);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(INITIAL_HEALTH_LOGS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);

  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Initialize and try syncing with Firestore
  useEffect(() => {
    let unsubscribeBatches: (() => void) | undefined;
    let unsubscribeDailyLogs: (() => void) | undefined;
    let unsubscribeFeeds: (() => void) | undefined;
    let unsubscribeEggs: (() => void) | undefined;
    let unsubscribeHealth: (() => void) | undefined;
    let unsubscribeExpenses: (() => void) | undefined;
    let unsubscribeSales: (() => void) | undefined;

    async function initFirestore() {
      try {
        const connected = await testConnection();
        setIsFirebaseConnected(connected);

        // Check if batches collection exists in Firestore
        const batchesSnap = await getDocs(collection(db, 'batches')).catch(() => null);

        // If firestore is connected and empty, seed it once with rich initial data
        if (batchesSnap && batchesSnap.empty) {
          console.log('Seeding initial data to Firestore...');
          const batchOp = writeBatch(db);

          INITIAL_BATCHES.forEach(b => {
            batchOp.set(doc(db, 'batches', b.id), b);
          });
          INITIAL_FEEDS.forEach(f => {
            batchOp.set(doc(db, 'feedInventory', f.id), f);
          });
          INITIAL_DAILY_LOGS.forEach(l => {
            batchOp.set(doc(db, 'dailyLogs', l.id), l);
          });
          INITIAL_EGG_COLLECTIONS.forEach(e => {
            batchOp.set(doc(db, 'eggCollections', e.id), e);
          });
          INITIAL_HEALTH_LOGS.forEach(h => {
            batchOp.set(doc(db, 'healthLogs', h.id), h);
          });
          INITIAL_EXPENSES.forEach(exp => {
            batchOp.set(doc(db, 'expenses', exp.id), exp);
          });
          INITIAL_SALES.forEach(s => {
            batchOp.set(doc(db, 'sales', s.id), s);
          });

          await batchOp.commit();
        }

        // Setup real-time listeners with mandatory error handling
        unsubscribeBatches = onSnapshot(
          collection(db, 'batches'),
          (snap) => {
            if (!snap.empty) {
              const list: Batch[] = [];
              snap.forEach(d => list.push({ ...(d.data() as Batch), id: d.id }));
              setBatches(list);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'batches');
          }
        );

        unsubscribeDailyLogs = onSnapshot(
          collection(db, 'dailyLogs'),
          (snap) => {
            if (!snap.empty) {
              const list: DailyLog[] = [];
              snap.forEach(d => list.push({ ...(d.data() as DailyLog), id: d.id }));
              setDailyLogs(list);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'dailyLogs');
          }
        );

        unsubscribeFeeds = onSnapshot(
          collection(db, 'feedInventory'),
          (snap) => {
            if (!snap.empty) {
              const list: FeedItem[] = [];
              snap.forEach(d => list.push({ ...(d.data() as FeedItem), id: d.id }));
              setFeedInventory(list);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'feedInventory');
          }
        );

        unsubscribeEggs = onSnapshot(
          collection(db, 'eggCollections'),
          (snap) => {
            if (!snap.empty) {
              const list: EggCollection[] = [];
              snap.forEach(d => list.push({ ...(d.data() as EggCollection), id: d.id }));
              setEggCollections(list);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'eggCollections');
          }
        );

        unsubscribeHealth = onSnapshot(
          collection(db, 'healthLogs'),
          (snap) => {
            if (!snap.empty) {
              const list: HealthLog[] = [];
              snap.forEach(d => list.push({ ...(d.data() as HealthLog), id: d.id }));
              setHealthLogs(list);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'healthLogs');
          }
        );

        unsubscribeExpenses = onSnapshot(
          collection(db, 'expenses'),
          (snap) => {
            if (!snap.empty) {
              const list: Expense[] = [];
              snap.forEach(d => list.push({ ...(d.data() as Expense), id: d.id }));
              setExpenses(list);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'expenses');
          }
        );

        unsubscribeSales = onSnapshot(
          collection(db, 'sales'),
          (snap) => {
            if (!snap.empty) {
              const list: Sale[] = [];
              snap.forEach(d => list.push({ ...(d.data() as Sale), id: d.id }));
              setSales(list);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, 'sales');
          }
        );

      } catch (err) {
        console.warn('Fallback to local storage / memory state:', err);
        // Load from local storage if available
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.batches) setBatches(parsed.batches);
            if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
            if (parsed.feedInventory) setFeedInventory(parsed.feedInventory);
            if (parsed.eggCollections) setEggCollections(parsed.eggCollections);
            if (parsed.healthLogs) setHealthLogs(parsed.healthLogs);
            if (parsed.expenses) setExpenses(parsed.expenses);
            if (parsed.sales) setSales(parsed.sales);
          } catch {
            // Keep default initial
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    initFirestore();

    return () => {
      unsubscribeBatches?.();
      unsubscribeDailyLogs?.();
      unsubscribeFeeds?.();
      unsubscribeEggs?.();
      unsubscribeHealth?.();
      unsubscribeExpenses?.();
      unsubscribeSales?.();
    };
  }, []);

  // Save to local storage for offline resilience
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          batches,
          dailyLogs,
          feedInventory,
          eggCollections,
          healthLogs,
          expenses,
          sales,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [batches, dailyLogs, feedInventory, eggCollections, healthLogs, expenses, sales]);

  // Compute KPI metrics
  const totalBirdsAlive = batches
    .filter((b) => b.status === 'Active')
    .reduce((sum, b) => sum + (b.currentCount || 0), 0);

  // Today's formatted date string YYYY-MM-DD
  const todayStr = '2026-10-26'; // anchored to current session date
  
  const totalEggsToday = eggCollections
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + (e.totalEggs || 0), 0);

  const totalFeedStockKg = feedInventory.reduce((sum, f) => sum + (f.stockKg || 0), 0);

  // Mortality in the past 7 days
  const sevenDaysAgo = '2026-10-19';
  const mortalityThisWeek = dailyLogs
    .filter((l) => l.date >= sevenDaysAgo && l.date <= todayStr)
    .reduce((sum, l) => sum + (l.mortalityCount || 0), 0);

  // Profit this month (October 2026)
  const currentMonth = '2026-10';
  const totalIncomeMonth = sales
    .filter((s) => s.date.startsWith(currentMonth))
    .reduce((sum, s) => sum + (s.totalPhp || 0), 0);
  const totalExpenseMonth = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + (e.amountPhp || 0), 0);
  const profitThisMonth = totalIncomeMonth - totalExpenseMonth;

  // Alerts logic:
  // 1. Low feed stock (< 50kg)
  // 2. Vaccination due today
  // 3. High mortality (> 1% flock or >= 5 birds in a day)
  const alerts: FarmAlert[] = [];

  feedInventory.forEach((f) => {
    if (f.stockKg < 50) {
      alerts.push({
        id: `alert-feed-${f.id}`,
        type: 'danger',
        title: 'Low Feed Stock Alert',
        message: `${f.feedType} stock is only ${f.stockKg} kg (below 50 kg threshold). Reorder required immediately.`,
        linkTab: 'feed',
      });
    }
  });

  healthLogs.forEach((h) => {
    if (h.date === todayStr && h.status === 'Scheduled') {
      alerts.push({
        id: `alert-vaccine-${h.id}`,
        type: 'warning',
        title: 'Vaccination Due Today',
        message: `${h.vaccineName} scheduled today for Batch ${h.batchId}. Dosage: ${h.dosage}`,
        linkTab: 'health',
      });
    }
  });

  dailyLogs
    .filter((l) => l.date === todayStr && l.mortalityCount >= 5)
    .forEach((l) => {
      alerts.push({
        id: `alert-mortality-${l.id}`,
        type: 'danger',
        title: 'High Mortality Warning',
        message: `High mortality detected on Batch ${l.batchId}: ${l.mortalityCount} birds lost today (${l.mortalityCause || 'unspecified'}).`,
        linkTab: 'batches',
      });
    });

  // Actions
  const addBatch = async (data: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `batch-${data.batchId.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const now = new Date().toISOString();
    const newBatch: Batch = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    setBatches((prev) => [newBatch, ...prev]);

    try {
      await setDoc(doc(db, 'batches', id), newBatch);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `batches/${id}`);
    }
  };

  const updateBatch = async (id: string, updates: Partial<Batch>) => {
    const now = new Date().toISOString();
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: now } : b))
    );

    try {
      await updateDoc(doc(db, 'batches', id), { ...updates, updatedAt: now });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `batches/${id}`);
    }
  };

  const addMortality = async (batchId: string, count: number, cause: string, date: string = todayStr) => {
    const batch = batches.find((b) => b.batchId === batchId || b.id === batchId);
    if (!batch) return;

    const newMortalityTotal = (batch.mortalityCount || 0) + count;
    const newCurrent = Math.max(0, (batch.currentCount || 0) - count);

    await updateBatch(batch.id, {
      mortalityCount: newMortalityTotal,
      currentCount: newCurrent,
    });

    // Also record in daily logs
    await addDailyLog({
      batchId: batch.batchId,
      date,
      feedConsumedKg: 0,
      waterConsumedL: 0,
      mortalityCount: count,
      mortalityCause: cause,
      eggsCollectedPcs: 0,
      notes: `Mortality incident logged: ${count} birds (${cause})`,
    });
  };

  const sellBatch = async (
    batchId: string,
    buyer: string,
    countSold: number,
    pricePerBird: number,
    notes?: string
  ) => {
    const batch = batches.find((b) => b.batchId === batchId || b.id === batchId);
    if (!batch) return;

    const remaining = Math.max(0, batch.currentCount - countSold);
    const totalPhp = countSold * pricePerBird;

    await updateBatch(batch.id, {
      currentCount: remaining,
      status: remaining === 0 ? 'Sold' : 'Active',
      notes: notes ? `${batch.notes || ''} | Sold ${countSold} birds to ${buyer}` : batch.notes,
    });

    await addSale({
      batchId: batch.batchId,
      date: todayStr,
      type: 'Bird Sales',
      buyer,
      quantity: countSold,
      unit: 'birds',
      unitPricePhp: pricePerBird,
      totalPhp,
      notes: notes || `Batch ${batch.batchId} sales clearance`,
    });
  };

  const transferBatch = async (batchId: string, destinationNotes: string) => {
    const batch = batches.find((b) => b.batchId === batchId || b.id === batchId);
    if (!batch) return;

    await updateBatch(batch.id, {
      notes: `${batch.notes || ''}\n[Transferred ${todayStr}]: ${destinationNotes}`,
    });
  };

  const addDailyLog = async (logData: Omit<DailyLog, 'id' | 'createdAt'>) => {
    const id = `log-${Date.now()}`;
    const now = new Date().toISOString();
    const newLog: DailyLog = {
      ...logData,
      id,
      createdAt: now,
    };

    setDailyLogs((prev) => [newLog, ...prev]);

    // Update batch stats if mortality or average weight changed
    const targetBatch = batches.find((b) => b.batchId === logData.batchId);
    if (targetBatch) {
      const updates: Partial<Batch> = {};
      if (logData.mortalityCount > 0) {
        updates.mortalityCount = (targetBatch.mortalityCount || 0) + logData.mortalityCount;
        updates.currentCount = Math.max(0, (targetBatch.currentCount || 0) - logData.mortalityCount);
      }
      if (logData.averageWeightKg && logData.averageWeightKg > 0) {
        updates.averageWeightKg = logData.averageWeightKg;
      }
      if (Object.keys(updates).length > 0) {
        await updateBatch(targetBatch.id, updates);
      }
    }

    // Auto deduct feed inventory if feed was consumed and feed type specified
    if (logData.feedConsumedKg > 0 && logData.feedType) {
      const feed = feedInventory.find(
        (f) => f.feedType.toLowerCase() === logData.feedType?.toLowerCase()
      );
      if (feed) {
        const newStock = Math.max(0, feed.stockKg - logData.feedConsumedKg);
        await setFeedInventory((prev) =>
          prev.map((f) => (f.id === feed.id ? { ...f, stockKg: newStock } : f))
        );
        try {
          await updateDoc(doc(db, 'feedInventory', feed.id), {
            stockKg: newStock,
            updatedAt: now,
          });
        } catch {
          // local fallback
        }
      }
    }

    // If eggs collected, also register in egg collections for today
    if (logData.eggsCollectedPcs > 0 && targetBatch?.breed === 'Layer') {
      const small = Math.round(logData.eggsCollectedPcs * 0.15);
      const medium = Math.round(logData.eggsCollectedPcs * 0.35);
      const large = Math.round(logData.eggsCollectedPcs * 0.38);
      const xl = logData.eggsCollectedPcs - (small + medium + large);

      await addEggCollection({
        batchId: logData.batchId,
        date: logData.date,
        gradeSmall: small,
        gradeMedium: medium,
        gradeLarge: large,
        gradeXL: xl,
        notes: logData.notes || 'Auto-created from daily log',
      });
    }

    try {
      await setDoc(doc(db, 'dailyLogs', id), newLog);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `dailyLogs/${id}`);
    }
  };

  const addFeedItem = async (data: Omit<FeedItem, 'id' | 'updatedAt'>) => {
    const id = `feed-${Date.now()}`;
    const now = new Date().toISOString();
    const newItem: FeedItem = { ...data, id, updatedAt: now };

    setFeedInventory((prev) => [...prev, newItem]);
    try {
      await setDoc(doc(db, 'feedInventory', id), newItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `feedInventory/${id}`);
    }
  };

  const restockFeed = async (id: string, additionalKg: number, newPricePerKg?: number) => {
    const now = new Date().toISOString();
    setFeedInventory((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            stockKg: f.stockKg + additionalKg,
            pricePerKg: newPricePerKg !== undefined ? newPricePerKg : f.pricePerKg,
            updatedAt: now,
          };
        }
        return f;
      })
    );

    const target = feedInventory.find((f) => f.id === id);
    if (!target) return;

    const updatedStock = target.stockKg + additionalKg;
    const updatedPrice = newPricePerKg !== undefined ? newPricePerKg : target.pricePerKg;

    // Record expense for feed restocking
    await addExpense({
      date: todayStr,
      category: 'Feed',
      amountPhp: additionalKg * updatedPrice,
      description: `Restock ${target.feedType} (+${additionalKg} kg @ ₱${updatedPrice}/kg)`,
    });

    try {
      await updateDoc(doc(db, 'feedInventory', id), {
        stockKg: updatedStock,
        pricePerKg: updatedPrice,
        updatedAt: now,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `feedInventory/${id}`);
    }
  };

  const calculateFCR = (batchId: string) => {
    const batch = batches.find((b) => b.batchId === batchId || b.id === batchId);
    if (!batch) return { totalFeedKg: 0, weightGainKg: 0, fcr: 0 };

    const logs = dailyLogs.filter((l) => l.batchId === batch.batchId);
    const totalFeedKg = logs.reduce((sum, l) => sum + (l.feedConsumedKg || 0), 0);

    const currentWeightGainKg = (batch.currentCount || 0) * (batch.averageWeightKg || 0);

    // If layer, FCR also includes egg mass (standard egg ~ 55g = 0.055kg)
    const totalEggs = logs.reduce((sum, l) => sum + (l.eggsCollectedPcs || 0), 0);
    const eggMassKg = totalEggs * 0.055;

    const denominator = batch.breed === 'Layer' ? eggMassKg || 1 : currentWeightGainKg || 1;
    const fcr = denominator > 0 ? Number((totalFeedKg / denominator).toFixed(2)) : 0;

    return { totalFeedKg, weightGainKg: denominator, fcr };
  };

  const addEggCollection = async (data: Omit<EggCollection, 'id' | 'createdAt' | 'totalEggs'>) => {
    const totalEggs = data.gradeSmall + data.gradeMedium + data.gradeLarge + data.gradeXL;
    const id = `egg-${Date.now()}`;
    const now = new Date().toISOString();
    const newCollection: EggCollection = {
      ...data,
      totalEggs,
      id,
      createdAt: now,
    };

    setEggCollections((prev) => [newCollection, ...prev]);

    try {
      await setDoc(doc(db, 'eggCollections', id), newCollection);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `eggCollections/${id}`);
    }
  };

  const addHealthLog = async (data: Omit<HealthLog, 'id' | 'createdAt'>) => {
    const id = `health-${Date.now()}`;
    const now = new Date().toISOString();
    const newLog: HealthLog = {
      ...data,
      id,
      createdAt: now,
    };

    setHealthLogs((prev) => [newLog, ...prev]);

    if (data.cost > 0) {
      await addExpense({
        batchId: data.batchId,
        date: data.date,
        category: 'Vaccine',
        amountPhp: data.cost,
        description: `Vaccine administration: ${data.vaccineName} (${data.batchId})`,
      });
    }

    try {
      await setDoc(doc(db, 'healthLogs', id), newLog);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `healthLogs/${id}`);
    }
  };

  const completeVaccination = async (id: string) => {
    setHealthLogs((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: 'Completed' as const } : h))
    );

    try {
      await updateDoc(doc(db, 'healthLogs', id), { status: 'Completed' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `healthLogs/${id}`);
    }
  };

  const addExpense = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const id = `exp-${Date.now()}`;
    const now = new Date().toISOString();
    const newExp: Expense = { ...data, id, createdAt: now };

    setExpenses((prev) => [newExp, ...prev]);

    try {
      await setDoc(doc(db, 'expenses', id), newExp);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `expenses/${id}`);
    }
  };

  const addSale = async (data: Omit<Sale, 'id' | 'createdAt'>) => {
    const id = `sale-${Date.now()}`;
    const now = new Date().toISOString();
    const newSale: Sale = { ...data, id, createdAt: now };

    setSales((prev) => [newSale, ...prev]);

    try {
      await setDoc(doc(db, 'sales', id), newSale);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `sales/${id}`);
    }
  };

  const resetToDemoData = async () => {
    setBatches(INITIAL_BATCHES);
    setDailyLogs(INITIAL_DAILY_LOGS);
    setFeedInventory(INITIAL_FEEDS);
    setEggCollections(INITIAL_EGG_COLLECTIONS);
    setHealthLogs(INITIAL_HEALTH_LOGS);
    setExpenses(INITIAL_EXPENSES);
    setSales(INITIAL_SALES);

    try {
      const batchOp = writeBatch(db);
      INITIAL_BATCHES.forEach((b) => batchOp.set(doc(db, 'batches', b.id), b));
      INITIAL_FEEDS.forEach((f) => batchOp.set(doc(db, 'feedInventory', f.id), f));
      INITIAL_DAILY_LOGS.forEach((l) => batchOp.set(doc(db, 'dailyLogs', l.id), l));
      INITIAL_EGG_COLLECTIONS.forEach((e) => batchOp.set(doc(db, 'eggCollections', e.id), e));
      INITIAL_HEALTH_LOGS.forEach((h) => batchOp.set(doc(db, 'healthLogs', h.id), h));
      INITIAL_EXPENSES.forEach((exp) => batchOp.set(doc(db, 'expenses', exp.id), exp));
      INITIAL_SALES.forEach((s) => batchOp.set(doc(db, 'sales', s.id), s));
      await batchOp.commit();
    } catch {
      // Local reset
    }
  };

  return (
    <FarmContext.Provider
      value={{
        batches,
        dailyLogs,
        feedInventory,
        eggCollections,
        healthLogs,
        expenses,
        sales,
        isLoading,
        isFirebaseConnected,
        totalBirdsAlive,
        totalEggsToday,
        totalFeedStockKg,
        mortalityThisWeek,
        profitThisMonth,
        alerts,
        addBatch,
        updateBatch,
        addMortality,
        sellBatch,
        transferBatch,
        addDailyLog,
        addFeedItem,
        restockFeed,
        calculateFCR,
        addEggCollection,
        addHealthLog,
        completeVaccination,
        addExpense,
        addSale,
        resetToDemoData,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
