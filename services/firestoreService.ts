import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
} from "firebase/firestore";
import type { Child, Insight, ChatMessage } from '../types';

// Type definitions for Firestore data
type ChildDoc = Omit<Child, 'id'> & { name: string; birthDate: string; createdAt: Timestamp };
type InsightDoc = Omit<Insight, 'id' | 'createdAt'> & { createdAt: Timestamp };
type MessageDoc = Omit<ChatMessage, 'id' | 'childId' | 'createdAt'> & { role: 'user' | 'assistant'; content: string; createdAt: Timestamp };

// --- Children ---

export function onChildrenUpdate(callback: (children: Child[]) => void) {
  const q = query(collection(db, "children"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (querySnapshot) => {
    const children: Child[] = querySnapshot.docs.map(doc => {
      const { name, birthDate } = doc.data();
      return {
        id: doc.id,
        name,
        birthDate,
      };
    });
    callback(children);
  });
}

export async function addChild(childData: Omit<Child, 'id'>) {
    await addDoc(collection(db, "children"), {
        ...childData,
        createdAt: serverTimestamp()
    });
}

// --- Insights ---

export function onInsightsUpdate(childId: string, callback: (insights: Insight[]) => void) {
  const q = query(collection(db, "insights"), where("childId", "==", childId));
  return onSnapshot(q, (querySnapshot) => {
    const insights = querySnapshot.docs.map(doc => {
        const { childId, category, title, observation, recommendation, status, iconName, type, createdAt } = doc.data() as InsightDoc;
        // When a document is created locally, `createdAt` can be null until the server
        // assigns the timestamp. This check prevents a crash.
        if (!createdAt) return null;
        
        return {
          id: doc.id, 
          childId,
          category,
          title,
          observation,
          recommendation,
          status,
          iconName,
          type,
          createdAt: createdAt.toDate().toISOString(),
        };
      })
      .filter((insight): insight is Insight => insight !== null);

    // Sort on the client since we removed it from the query.
    const sortedInsights = insights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(sortedInsights);
  });
}

export async function addInsight(insightData: Omit<Insight, 'id'>) {
    await addDoc(collection(db, "insights"), {
        ...insightData,
        createdAt: serverTimestamp()
    });
}

// --- Messages ---

export function onMessagesUpdate(childId: string, callback: (messages: ChatMessage[]) => void) {
  const messagesCollectionRef = collection(db, `messages/${childId}/history`);
  const q = query(messagesCollectionRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => {
        const { role, content, questionCategory, createdAt } = doc.data() as MessageDoc;
        // When a document is created locally, `createdAt` can be null until the server
        // assigns the timestamp. This check prevents a crash.
        if (!createdAt) return null;
        
        return {
          id: doc.id,
          childId: childId,
          role,
          content,
          questionCategory,
          createdAt: createdAt.toDate().toISOString(),
        };
      })
      .filter((message): message is ChatMessage => message !== null);

    callback(messages);
  });
}

export async function addMessage(childId: string, messageData: Omit<ChatMessage, 'id' | 'childId' | 'createdAt'>) {
  const messagesCollectionRef = collection(db, `messages/${childId}/history`);
  // Ensure the parent document exists, which can be useful
  // Although not strictly necessary as subcollections can exist without a parent doc
  await addDoc(messagesCollectionRef, {
      ...messageData,
      createdAt: serverTimestamp()
  });
}