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
      const data = doc.data();
      // Explicitly create a new plain object to prevent any circular references
      // from leaking from the Firebase SDK's internal objects.
      return {
        id: doc.id,
        name: data.name,
        birthDate: data.birthDate,
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
        const data = doc.data();
        // A server timestamp can be pending, so we must check for its existence.
        if (!data || !data.createdAt) {
          return null;
        }
        
        // Explicitly create a new plain object to prevent any circular references
        // from leaking from the Firebase SDK's internal objects.
        const plainInsight: Insight = {
          id: doc.id, 
          childId: data.childId,
          category: data.category,
          title: data.title,
          observation: data.observation,
          recommendation: data.recommendation,
          status: data.status,
          iconName: data.iconName,
          type: data.type,
          createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        };
        return plainInsight;
      })
      .filter((insight): insight is Insight => insight !== null);

    // Sort on the client since we removed it from the query.
    const sortedInsights = insights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(sortedInsights);
  });
}

export async function addInsight(insightData: Omit<Insight, 'id'>): Promise<Insight> {
    const docRef = await addDoc(collection(db, "insights"), {
        ...insightData,
        createdAt: serverTimestamp()
    });
    
    // Return the created insight with the generated ID
    return {
        id: docRef.id,
        ...insightData,
        createdAt: new Date().toISOString() // Use current time as fallback
    };
}

// --- Messages ---

export function onMessagesUpdate(childId: string, callback: (messages: ChatMessage[]) => void) {
  const messagesCollectionRef = collection(db, `messages/${childId}/history`);
  const q = query(messagesCollectionRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        // A server timestamp can be pending, so we must check for its existence.
        if (!data || !data.createdAt) {
          return null;
        }
        
        // Explicitly create a new plain object to prevent any circular references
        // from leaking from the Firebase SDK's internal objects.
        const plainMessage: ChatMessage = {
          id: doc.id,
          childId: childId,
          role: data.role,
          content: data.content,
          createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
          questionCategory: data.questionCategory,
        };
        return plainMessage;
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