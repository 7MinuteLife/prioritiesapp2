import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/firebase/admin';
import { collection, getDocs, doc, Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`API: Getting priority lists for user: ${userId}`);
    
    const userRef = doc(serverDb, 'users', userId);
    const listsRef = collection(userRef, 'priorityLists');
    const querySnapshot = await getDocs(listsRef);
    
    const lists = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        listName: data.listName || 'Untitled List',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        values: data.values || { column4: { values: [] } }
      };
    });
    
    console.log(`API: Retrieved ${lists.length} priority lists`);
    
    return NextResponse.json(lists);
  } catch (error: any) {
    console.error('API Error getting priority lists:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get priority lists' },
      { status: 500 }
    );
  }
} 