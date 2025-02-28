import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/firebase/admin';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const listId = searchParams.get('listId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!listId) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    console.log(`API: Getting values for user: ${userId}, list: ${listId}`);
    
    const docRef = doc(serverDb, 'users', userId, 'priorityLists', listId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }
    
    const data = docSnap.data();
    
    // Convert Firestore timestamps to ISO strings for JSON serialization
    const formattedData = {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null
    };
    
    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error('API Error getting values:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get values' },
      { status: 500 }
    );
  }
} 